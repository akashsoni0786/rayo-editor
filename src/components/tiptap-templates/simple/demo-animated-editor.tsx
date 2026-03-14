import * as React from "react"
import { SimpleEditorAnimated } from "./simple-editor-animated"

export function DemoAnimatedEditor() {
  return (
    <div style={{ 
      padding: "2rem", 
      height: "100vh", 
      backgroundColor: "#f8fafc",
      display: "flex",
      flexDirection: "column",
      gap: "1rem"
    }}>
      <h1 style={{ 
        fontSize: "1.5rem", 
        fontWeight: "bold", 
        color: "#1f2937",
        margin: 0 
      }}>
        Animated TipTap Editor with Dock-Style Toolbar
      </h1>
      
      <p style={{ 
        color: "#6b7280", 
        fontSize: "0.875rem",
        margin: 0 
      }}>
        Hover over the toolbar buttons to see the smooth magnification effect
      </p>
      
      <div style={{ 
        flex: 1, 
        backgroundColor: "white", 
        borderRadius: "0.5rem", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        position: "relative",
        overflow: "hidden"
      }}>
        <SimpleEditorAnimated />
      </div>
    </div>
  )
}