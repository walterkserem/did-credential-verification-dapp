import React, { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  const [title, setTitle] = useState("");
  const [credentialType, setCredentialType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [credentials, setCredentials] = useState([]);
  const [status, setStatus] = useState("");

  const [verifyFile, setVerifyFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask not detected.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const didContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setAccount(address);
      setContract(didContract);
      setStatus("Wallet connected successfully.");
    } catch (error) {
      console.error("Connect wallet error:", error);
      setStatus("Failed to connect wallet.");
    }
  };

  const hashFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    return ethers.keccak256(bytes);
  };

  const addCredential = async () => {
    if (!contract || !account) {
      setStatus("Connect wallet first.");
      return;
    }

    if (!title.trim() || !credentialType.trim() || !selectedFile) {
      setStatus("Fill in all fields and upload a document.");
      return;
    }

    try {
      setStatus("Hashing file...");
      const fileHash = await hashFile(selectedFile);

      setStatus("Sending transaction...");
      const tx = await contract.addCredential(
        title.trim(),
        credentialType.trim(),
        fileHash
      );
      await tx.wait();

      setStatus("Credential added successfully.");
      setTitle("");
      setCredentialType("");
      setSelectedFile(null);
      setVerificationResult("");

      await loadCredentials();
    } catch (error) {
      console.error("Add credential error:", error);
      setStatus("Failed to add credential.");
    }
  };

  const loadCredentials = async () => {
  if (!contract || !account) {
    setStatus("Connect wallet first.");
    return;
  }

  try {
    setStatus("Loading credentials...");
    console.log("Connected account:", account);
    console.log("Contract address:", CONTRACT_ADDRESS);
    console.log("Contract instance:", contract);

    const result = await contract.getCredentials(account);

    console.log("Credentials result:", result);

    setCredentials(result);
    setStatus("Credentials loaded.");
  } catch (error) {
    console.error("Load credentials error:", error);
    setStatus(
      "Failed to load credentials: " +
        (error.reason || error.shortMessage || error.message)
    );
  }
};

  const revokeCredential = async (index) => {
    if (!contract || !account) {
      setStatus("Connect wallet first.");
      return;
    }

    try {
      setStatus("Revoking credential...");
      const tx = await contract.revokeCredential(index);
      await tx.wait();

      setStatus("Credential revoked.");
      await loadCredentials();
    } catch (error) {
      console.error("Revoke credential error:", error);
      setStatus("Failed to revoke credential.");
    }
  };

  const verifyCredential = async () => {
    if (!contract || !account) {
      setStatus("Connect wallet first.");
      return;
    }

    if (!verifyFile) {
      setStatus("Upload a document to verify.");
      return;
    }

    try {
      setStatus("Hashing uploaded verification file...");
      const uploadedHash = await hashFile(verifyFile);

      setStatus("Checking blockchain records...");
      const result = await contract.getCredentials(account);

      const match = result.find(
        (cred) =>
          cred.documentHash.toLowerCase() === uploadedHash.toLowerCase() &&
          cred.isValid
      );

      if (match) {
        setVerificationResult(
          `Verified: "${match.title}" (${match.credentialType}) is valid on-chain.`
        );
      } else {
        setVerificationResult(
          "Verification failed: no matching valid credential found."
        );
      }

      setStatus("Verification complete.");
    } catch (error) {
      console.error("Verify credential error:", error);
      setStatus("Failed to verify credential.");
      setVerificationResult("");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>DID Credential Verification System</h1>
            <p style={styles.subtitle}>
              Securely issue, manage, and verify document-based credentials on blockchain.
            </p>
          </div>

          <button style={styles.primaryButton} onClick={connectWallet}>
            {account ? "Wallet Connected" : "Connect MetaMask"}
          </button>
        </header>

        <div style={styles.statusBar}>
          <strong>Status:</strong> {status || "Ready"}
        </div>

        <div style={styles.walletCard}>
          <h3 style={styles.cardTitle}>Connected Identity</h3>
          <p style={styles.mutedText}>
            {account || "No wallet connected yet."}
          </p>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Issue Credential</h2>

            <label style={styles.label}>Credential Title</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Bachelor of Science in IT"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label style={styles.label}>Credential Type</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Degree, Certificate, National ID"
              value={credentialType}
              onChange={(e) => setCredentialType(e.target.value)}
            />

            <label style={styles.label}>Upload Supporting Document</label>
            <input
              style={styles.fileInput}
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0] || null)}
            />

            {selectedFile && (
              <p style={styles.fileInfo}>
                Selected file: <strong>{selectedFile.name}</strong>
              </p>
            )}

            <button style={styles.primaryButton} onClick={addCredential}>
              Add Credential
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>My Credentials</h2>

            <button style={styles.secondaryButton} onClick={loadCredentials}>
              Load Credentials
            </button>

            <div style={{ marginTop: "20px" }}>
              {credentials.length === 0 ? (
                <p style={styles.mutedText}>No credentials loaded yet.</p>
              ) : (
                credentials.map((cred, index) => (
                  <div key={index} style={styles.credentialCard}>
                    <p>
                      <strong>Title:</strong> {cred.title}
                    </p>
                    <p>
                      <strong>Type:</strong> {cred.credentialType}
                    </p>
                    <p>
                      <strong>Document Hash:</strong> {cred.documentHash}
                    </p>
                    <p>
                      <strong>Issuer:</strong> {cred.issuer}
                    </p>
                    <p>
                      <strong>Timestamp:</strong>{" "}
                      {new Date(Number(cred.timestamp) * 1000).toLocaleString()}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        style={{
                          color: cred.isValid ? "green" : "red",
                          fontWeight: "bold",
                        }}
                      >
                        {cred.isValid ? "Valid" : "Revoked"}
                      </span>
                    </p>

                    <button
                      style={styles.dangerButton}
                      onClick={() => revokeCredential(index)}
                      disabled={!cred.isValid}
                    >
                      Revoke Credential
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "24px" }}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Verify Credential</h2>

            <label style={styles.label}>Upload Document for Verification</label>
            <input
              style={styles.fileInput}
              type="file"
              onChange={(e) => {
                setVerifyFile(e.target.files[0] || null);
                setVerificationResult("");
              }}
            />

            {verifyFile && (
              <p style={styles.fileInfo}>
                File to verify: <strong>{verifyFile.name}</strong>
              </p>
            )}

            <button style={styles.secondaryButton} onClick={verifyCredential}>
              Verify Credential
            </button>

            {verificationResult && (
              <div style={styles.verificationBox}>{verificationResult}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    gap: "20px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    color: "#111827",
  },
  subtitle: {
    marginTop: "8px",
    color: "#4b5563",
  },
  statusBar: {
    background: "#ffffff",
    padding: "14px 18px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
    color: "#1f2937",
  },
  walletCard: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "24px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  card: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: "18px",
    color: "#111827",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    marginTop: "14px",
    fontWeight: "bold",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    marginBottom: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  fileInput: {
    marginTop: "8px",
    marginBottom: "12px",
  },
  fileInfo: {
    color: "#374151",
    fontSize: "14px",
  },
  primaryButton: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  secondaryButton: {
    background: "#111827",
    color: "#ffffff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  dangerButton: {
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
  },
  credentialCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
    background: "#f9fafb",
    wordBreak: "break-word",
  },
  verificationBox: {
    marginTop: "16px",
    padding: "14px",
    borderRadius: "10px",
    background: "#eef6ff",
    color: "#1e3a8a",
    fontWeight: "bold",
  },
  mutedText: {
    color: "#6b7280",
  },
};

export default App;