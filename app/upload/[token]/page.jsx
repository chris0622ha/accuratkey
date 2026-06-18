"use client";
import { useState } from "react";
import { submitPhotoUpload } from "@/lib/firebase";

export default function PhotoUploadPage({ params }) {
  const token = params?.token;
  const [status, setStatus] = useState("ready");
  const [preview, setPreview] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setErrMsg("");
    try {
      const base64 = await new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          const scale = Math.min(600 / img.width, 600 / img.height, 1);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL("image/jpeg", 0.92));
        };
        img.onerror = () => reject(new Error("Could not read image"));
        img.src = url;
      });
      setPreview(base64);
      await submitPhotoUpload(token, base64);
      setStatus("done");
    } catch (err) {
      setErrMsg(err?.message || "Unknown error");
      setStatus("error");
    }
  };

  if (!token) return (
    <div style={{ minHeight:"100vh",background:"#0a0a0f",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif",color:"#ef4444",textAlign:"center",padding:24 }}>
      Invalid link.
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",background:"#0a0a0f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",padding:24,textAlign:"center" }}>
      <div style={{ fontSize:48,marginBottom:16 }}>📸</div>
      <h1 style={{ color:"#e0e0ff",fontSize:22,fontWeight:700,marginBottom:8 }}>
        <span style={{ color:"#7c6af7" }}>Accurat</span>Key
      </h1>
      <p style={{ color:"#555",fontSize:14,marginBottom:32 }}>Choose a photo from your phone</p>

      {status === "ready" && (
        <label style={{ display:"block",background:"#7c6af7",color:"#fff",padding:"14px 32px",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer" }}>
          📸 Add Photo
          <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
        </label>
      )}

      {status === "uploading" && (
        <div style={{ color:"#a78bfa",fontSize:15 }}>Uploading...</div>
      )}

      {status === "done" && (
        <div>
          {preview && <img src={preview} style={{ width:100,height:100,borderRadius:"50%",objectFit:"cover",marginBottom:16,border:"3px solid #7c6af7" }} />}
          <div style={{ color:"#34d399",fontSize:18,fontWeight:700,marginBottom:8 }}>✓ Photo sent!</div>
          <p style={{ color:"#555",fontSize:13 }}>Go back to your computer — it should appear automatically.</p>
        </div>
      )}

      {status === "error" && (
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:14 }}>
          <div style={{ color:"#ef4444",fontSize:15 }}>Something went wrong.</div>
          {errMsg && <div style={{ color:"#555",fontSize:11,maxWidth:260,wordBreak:"break-word" }}>{errMsg}</div>}
          <label style={{ display:"block",background:"#7c6af7",color:"#fff",padding:"12px 28px",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer" }}>
            Try Again
            <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
          </label>
        </div>
      )}
    </div>
  );
}
