export default function FullPageLoader({ message = "Processing..." }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.text}>{message}</p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(255, 255, 255, 0.45)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loaderContainer: {
    textAlign: "center",
  },
  spinner: {
    width: "60px",
    height: "60px",
    border: "6px solid #d1e3ff",
    borderTop: "6px solid #005ad4",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  text: {
    marginTop: "15px",
    fontSize: "18px",
    color: "#0047a3",
    fontWeight: "600",
  },
};

// Add global keyframes:
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`, styleSheet.cssRules.length);
