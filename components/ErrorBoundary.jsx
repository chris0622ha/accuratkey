"use client";
import React from "react";

// Without this, an uncaught error anywhere in the component tree makes React
// unmount everything below the nearest boundary — which, with no boundary
// anywhere in this app until now, meant the WHOLE app unmounted on any
// render error. Depending on exactly where in a render that happened, this
// could look like a flash back to a default screen with no explanation,
// which is exactly the "click a button → loading → back to map" symptom
// being reported with no way to see what actually went wrong. This makes
// the real error visible on screen instead of silently resetting.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error("AccuratKey crashed:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "'JetBrains Mono',monospace", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div style={{ color: "#f87171", fontWeight: 700, marginBottom: 10 }}>Something broke</div>
          <div style={{ color: "#9ca3af", fontSize: 12, maxWidth: 500, marginBottom: 6, wordBreak: "break-word" }}>
            {String(this.state.error?.message || this.state.error)}
          </div>
          {this.state.error?.stack && (
            <pre style={{ color: "#4b5563", fontSize: 10, maxWidth: 600, overflowX: "auto", textAlign: "left", background: "#13131f", padding: 12, borderRadius: 8, marginTop: 10 }}>
              {this.state.error.stack.split("\n").slice(0, 6).join("\n")}
            </pre>
          )}
          <button
            onClick={() => { this.setState({ error: null, info: null }); window.location.href = "/game"; }}
            style={{ marginTop: 20, background: "#7c6af7", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, padding: "10px 20px", cursor: "pointer" }}
          >
            Back to level map
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
