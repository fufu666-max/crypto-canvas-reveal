import { ReactElement } from "react";

interface ErrorNotDeployedProps {
  contractName: string;
  chainId: number | undefined;
}

export function errorNotDeployed(chainId: number | undefined): ReactElement;
export function errorNotDeployed(props: ErrorNotDeployedProps): ReactElement;

export function errorNotDeployed(chainIdOrProps: number | undefined | ErrorNotDeployedProps): ReactElement {
  const chainId = typeof chainIdOrProps === 'object' ? chainIdOrProps.chainId : chainIdOrProps;
  const contractName = typeof chainIdOrProps === 'object' ? chainIdOrProps.contractName : 'FHECounter.sol';

  return (
    <div className="fhe-card p-8 max-w-2xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Contract Not Available</h3>
        <p className="text-gray-600 mb-6">
          The <span className="font-mono bg-gray-100 px-2 py-1 rounded">{contractName}</span> contract
          is not deployed on chain ID <span className="font-mono bg-gray-100 px-2 py-1 rounded">{chainId}</span>
          {chainId === 11155111 ? " (Sepolia)" : ""}.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-3">To deploy the contract, run:</p>
          <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm font-mono mb-2">
            npx hardhat deploy --network {chainId === 11155111 ? "sepolia" : "your-network-name"}
          </code>
          <p className="text-xs text-gray-600 mt-2">
            Make sure you have set up your environment variables in <code className="bg-gray-200 px-1 rounded">.env</code> file.
          </p>
        </div>

        <div className="text-sm text-gray-500">
          <p>Alternatively, switch to the local Hardhat Node in your wallet.</p>
        </div>
      </div>
    </div>
  );
}
