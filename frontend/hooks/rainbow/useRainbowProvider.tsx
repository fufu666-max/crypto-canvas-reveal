import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Eip1193Provider, ethers } from "ethers";
import { useEip6963 } from "../metamask/useEip6963";

interface ProviderConnectInfo {
  readonly chainId: string;
}

interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

type ConnectListenerFn = (connectInfo: ProviderConnectInfo) => void;
type DisconnectListenerFn = (error: ProviderRpcError) => void;
type ChainChangedListenerFn = (chainId: string) => void;
type AccountsChangedListenerFn = (accounts: string[]) => void;

type Eip1193EventMap = {
  connect: ConnectListenerFn;
  chainChanged: ChainChangedListenerFn;
  accountsChanged: AccountsChangedListenerFn;
  disconnect: DisconnectListenerFn;
};

type Eip1193EventFn = <E extends keyof Eip1193EventMap>(
  event: E,
  fn: Eip1193EventMap[E]
) => void;

interface Eip1193ProviderWithEvent extends ethers.Eip1193Provider {
  on?: Eip1193EventFn;
  off?: Eip1193EventFn;
  addListener?: Eip1193EventFn;
  removeListener?: Eip1193EventFn;
}

export interface UseRainbowState {
  provider: Eip1193Provider | undefined;
  chainId: number | undefined;
  accounts: string[] | undefined;
  isConnected: boolean;
  error: Error | undefined;
  connect: () => void;
}

function useRainbowInternal(): UseRainbowState {
  const { error: eip6963Error, providers } = useEip6963();
  const [_currentProvider, _setCurrentProvider] = useState<
    Eip1193ProviderWithEvent | undefined
  >(undefined);
  const [chainId, _setChainId] = useState<number | undefined>(undefined);
  const [accounts, _setAccounts] = useState<string[] | undefined>(undefined);

  const connectListenerRef = useRef<ConnectListenerFn | undefined>(undefined);
  const disconnectListenerRef = useRef<DisconnectListenerFn | undefined>(
    undefined
  );
  const chainChangedListenerRef = useRef<ChainChangedListenerFn | undefined>(
    undefined
  );
  const accountsChangedListenerRef = useRef<
    AccountsChangedListenerFn | undefined
  >(undefined);

  const rainbowProviderRef = useRef<Eip1193ProviderWithEvent | undefined>(
    undefined
  );

  const hasProvider = Boolean(_currentProvider);
  const hasAccounts = (accounts?.length ?? 0) > 0;
  const hasChain = typeof chainId === "number";

  const isConnected = hasProvider && hasAccounts && hasChain;

  const connect = useCallback(() => {
    if (!_currentProvider) {
      return;
    }

    if (accounts && accounts.length > 0) {
      // already connected
      return;
    }

    // Prompt connection
    _currentProvider.request({ method: "eth_requestAccounts" });
  }, [_currentProvider, accounts]);

  useEffect(() => {
    let next: Eip1193ProviderWithEvent | undefined = undefined;
    for (let i = 0; i < providers.length; ++i) {
      const providerName = providers[i].info.name.toLowerCase();
      if (providerName.includes("rainbow") || providerName.includes("rainbowkit")) {
        next = providers[i].provider;
        break;
      }
    }

    if (!next && typeof window !== "undefined") {
      const maybeRainbow = (window as typeof window & { ethereum?: ethers.Eip1193Provider & { isRainbow?: boolean } }).ethereum;
      if (maybeRainbow) {
        next = maybeRainbow;
      }
    }

    const prev = rainbowProviderRef.current;
    if (prev === next) {
      return;
    }

    if (prev) {
      if (connectListenerRef.current) {
        prev.off?.("connect", connectListenerRef.current);
        prev.removeListener?.("connect", connectListenerRef.current);
        connectListenerRef.current = undefined;
      }

      if (disconnectListenerRef.current) {
        prev.off?.("disconnect", disconnectListenerRef.current);
        prev.removeListener?.("disconnect", disconnectListenerRef.current);
        disconnectListenerRef.current = undefined;
      }

      if (chainChangedListenerRef.current) {
        prev.off?.("chainChanged", chainChangedListenerRef.current);
        prev.removeListener?.("chainChanged", chainChangedListenerRef.current);
        chainChangedListenerRef.current = undefined;
      }

      if (accountsChangedListenerRef.current) {
        prev.off?.("accountsChanged", accountsChangedListenerRef.current);
        prev.removeListener?.(
          "accountsChanged",
          accountsChangedListenerRef.current
        );
        accountsChangedListenerRef.current = undefined;
      }
    }

    _setCurrentProvider(undefined);
    _setChainId(undefined);
    _setAccounts(undefined);

    rainbowProviderRef.current = next;

    let nextConnectListener: ConnectListenerFn | undefined = undefined;
    let nextDisconnectListener: DisconnectListenerFn | undefined = undefined;
    let nextChainChangedListener: ChainChangedListenerFn | undefined =
      undefined;
    let nextAccountsChangedListener: AccountsChangedListenerFn | undefined =
      undefined;

    connectListenerRef.current = undefined;
    disconnectListenerRef.current = undefined;
    chainChangedListenerRef.current = undefined;
    accountsChangedListenerRef.current = undefined;

    if (next) {
      // Connect
      nextConnectListener = (connectInfo: ProviderConnectInfo) => {
        if (next !== rainbowProviderRef.current) {
          return;
        }
        console.log(
          `[useRainbow] on('connect') chainId=${connectInfo.chainId}`
        );
        _setCurrentProvider(next);
        _setChainId(Number.parseInt(connectInfo.chainId, 16));
      };
      connectListenerRef.current = nextConnectListener;

      // Disconnect
      nextDisconnectListener = (error: ProviderRpcError) => {
        if (next !== rainbowProviderRef.current) {
          return;
        }
        console.log(`[useRainbow] on('disconnect') error code=${error.code}`);
        _setCurrentProvider(undefined);
        _setChainId(undefined);
        _setAccounts(undefined);
      };
      disconnectListenerRef.current = nextDisconnectListener;

      // ChainChanged
      nextChainChangedListener = (chainId: string) => {
        if (next !== rainbowProviderRef.current) {
          return;
        }
        console.log(`[useRainbow] on('chainChanged') chainId=${chainId}`);
        _setCurrentProvider(next);
        _setChainId(Number.parseInt(chainId, 16));
      };
      chainChangedListenerRef.current = nextChainChangedListener;

      // AccountsChanged
      nextAccountsChangedListener = (accounts: string[]) => {
        if (next !== rainbowProviderRef.current) {
          return;
        }
        console.log(
          `[useRainbow] on('accountsChanged') accounts.length=${accounts.length}`
        );
        _setCurrentProvider(next);
        _setAccounts(accounts);
      };
      accountsChangedListenerRef.current = nextAccountsChangedListener;

      // One or the other
      if (next.on) {
        next.on("connect", nextConnectListener);
        next.on("disconnect", nextDisconnectListener);
        next.on("chainChanged", nextChainChangedListener);
        next.on?.("accountsChanged", nextAccountsChangedListener);
      } else {
        next.addListener?.("connect", nextConnectListener);
        next.addListener?.("disconnect", nextDisconnectListener);
        next.addListener?.("chainChanged", nextChainChangedListener);
        next.addListener?.("accountsChanged", nextAccountsChangedListener);
      }

      const updateChainId = async () => {
        if (next !== rainbowProviderRef.current) {
          return;
        }

        try {
          const [chainIdHex, accountsArray] = await Promise.all([
            next.request({ method: "eth_chainId" }),
            next.request({ method: "eth_accounts" }),
          ]);

          console.log(
            `[useRainbow] connected to chainId=${chainIdHex} accounts.length=${accountsArray.length}`
          );

          _setCurrentProvider(next);
          _setChainId(Number.parseInt(chainIdHex, 16));
          _setAccounts(accountsArray);
        } catch {
          console.log(`[useRainbow] not connected!`);
          _setCurrentProvider(next);
          _setChainId(undefined);
          _setAccounts(undefined);
        }
      };

      updateChainId();
    }
  }, [providers]);

  // Unmount
  useEffect(() => {
    return () => {
      const current = rainbowProviderRef.current;

      if (current) {
        const chainChangedListener = chainChangedListenerRef.current;
        const accountsChangedListener = accountsChangedListenerRef.current;
        const connectListener = connectListenerRef.current;
        const disconnectListener = disconnectListenerRef.current;

        if (connectListener) {
          current.off?.("connect", connectListener);
          current.removeListener?.("connect", connectListener);
        }
        if (disconnectListener) {
          current.off?.("disconnect", disconnectListener);
          current.removeListener?.("disconnect", disconnectListener);
        }
        if (chainChangedListener) {
          current.off?.("chainChanged", chainChangedListener);
          current.removeListener?.("chainChanged", chainChangedListener);
        }
        if (accountsChangedListener) {
          current.off?.("accountsChanged", accountsChangedListener);
          current.removeListener?.("accountsChanged", accountsChangedListener);
        }
      }

      chainChangedListenerRef.current = undefined;
      rainbowProviderRef.current = undefined;
    };
  }, []);

  return {
    provider: _currentProvider,
    chainId,
    accounts,
    isConnected,
    error: eip6963Error,
    connect,
  };
}

interface RainbowProviderProps {
  children: ReactNode;
}

const RainbowContext = createContext<UseRainbowState | undefined>(undefined);

export const RainbowProvider: React.FC<RainbowProviderProps> = ({
  children,
}) => {
  const { provider, chainId, accounts, isConnected, error, connect } =
    useRainbowInternal();
  return (
    <RainbowContext.Provider
      value={{
        provider,
        chainId,
        accounts,
        isConnected,
        error,
        connect,
      }}
    >
      {children}
    </RainbowContext.Provider>
  );
};

export function useRainbow() {
  const context = useContext(RainbowContext);
  if (context === undefined) {
    throw new Error("useRainbow must be used within a RainbowProvider");
  }
  return context;
}

