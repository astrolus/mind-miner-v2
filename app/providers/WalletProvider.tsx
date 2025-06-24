'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

// Define the shape of the context data
interface WalletContextType {
  connectedWallet: boolean;
  walletAddress: string | null;
  isPeraLoading: boolean;
  handleConnectWallet: () => Promise<void>;
  totalAlgoEarned: number | null; // New: Total ALGO earned by the user
  showMessageBox: (title: string, content: string, onOk?: () => void) => void;
}

// Create the context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Create the provider component
export function WalletProvider({ children }: { children: ReactNode }) {
  const [connectedWallet, setConnectedWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isPeraLoading, setIsPeraLoading] = useState(true);
  const [totalAlgoEarned, setTotalAlgoEarned] = useState<number | null>(null); // New state

  // State for the custom message box
  const [messageBoxVisible, setMessageBoxVisible] = useState(false);
  const [messageBoxTitle, setMessageBoxTitle] = useState('');
  const [messageBoxContent, setMessageBoxContent] = useState('');
  const [onOkCallback, setOnOkCallback] = useState<(() => void) | null>(null);

  const peraWalletRef = useRef<PeraWalletConnect | null>(null);
  const isPeraInitialized = useRef(false);

  // All wallet logic is now centralized here
  useEffect(() => {
    const loadPeraWallet = async () => {
      if (typeof window !== 'undefined' && !isPeraInitialized.current) {
        isPeraInitialized.current = true;
        try {
          peraWalletRef.current = new PeraWalletConnect({ chainId: 416002 });

          const accounts = await peraWalletRef.current.reconnectSession();
          if (accounts.length > 0) {
            setConnectedWallet(true);
            setWalletAddress(accounts[0]);
            fetchPlayerAlgoStats(accounts[0]); // Fetch stats on reconnect
          }
        } catch (error) {
          console.error('Failed to load or reconnect PeraWalletConnect:', error);
          showMessageBox(
            'Error',
            'Failed to load wallet connector. Please refresh and try again.'
          );
        } finally {
          setIsPeraLoading(false);
        }
      } else if (isPeraInitialized.current) {
        setIsPeraLoading(false);
      }
    };

    loadPeraWallet();
  }, []);

  // New function to fetch player ALGO stats
  const fetchPlayerAlgoStats = async (address: string) => {
    try {
      const response = await fetch(`/api/get_player_stats?userId=${address}&type=rewards`);
      const data = await response.json();

      if (response.ok && data.success) {
        setTotalAlgoEarned(data.stats.rewards.totalAlgoEarned);
      } else {
        console.error('Failed to fetch player stats:', data.error);
        setTotalAlgoEarned(0); // Default to 0 if fetching fails
      }
    } catch (error) {
      console.error('Network error fetching player stats:', error);
      setTotalAlgoEarned(0); // Default to 0 on network error
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchPlayerAlgoStats(walletAddress); // Fetch stats when walletAddress becomes available
    }
  }, []);

  const showMessageBox = (title: string, content: string, onOk?: () => void) => {
    setMessageBoxTitle(title);
    setMessageBoxContent(content);
    setOnOkCallback(onOk ? () => onOk : null);
    setMessageBoxVisible(true);
  };

  const hideMessageBox = () => {
    setMessageBoxVisible(false);
    if (onOkCallback) {
      onOkCallback();
      setOnOkCallback(null); // Reset after execution
    }
  };

  const handleConnectWallet = async () => {
    if (isPeraLoading || !peraWalletRef.current) {
      showMessageBox('Please Wait', 'Wallet library is still loading.');
      return;
    }

    showMessageBox('Connecting Wallet...', 'Please open Pera Wallet to approve.');
    try {
      const accounts = await peraWalletRef.current.connect();
      if (accounts.length > 0) {
        setConnectedWallet(true);
        setWalletAddress(accounts[0]);
        fetchPlayerAlgoStats(accounts[0]); // Fetch stats on initial connect
        showMessageBox(
          'Wallet Connected!',
          `Connected: ${accounts[0].substring(0, 8)}...`
        );
      } else {
        showMessageBox('Connection Failed', 'No accounts found.');
      }
    } catch (error: any) {
      if (error.message?.includes('User denied connection')) {
        showMessageBox('Connection Denied', 'You cancelled the connection request.');
      } else {
        showMessageBox('Connection Error', `Failed to connect wallet: ${error.message || 'Unknown error'}.`);
      }
    }
  };

  const value = {
    connectedWallet,
    walletAddress,
    isPeraLoading,
    totalAlgoEarned, // Expose new state
    handleConnectWallet,
    showMessageBox,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
      {messageBoxVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center max-w-sm w-full animate-fade-in-up">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {messageBoxTitle}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {messageBoxContent}
            </p>
            <button
              onClick={hideMessageBox}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </WalletContext.Provider>
  );
}

// Custom hook to use the wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
