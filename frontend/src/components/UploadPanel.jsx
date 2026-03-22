// src/components/UploadPanel.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileImage, ArrowRight } from "lucide-react";
import { uploadBlueprint } from "../api/blueprintAPI";

export default function UploadPanel({ onWallsDetected }) {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async () => {
        if (!file) return alert("Select a file first");
        
        setIsUploading(true);
        try {
            const data = await uploadBlueprint(file);
            console.log("BACKEND RESPONSE:", data);

            // Validate response
            if (!data.walls && !data.segments && !data.lines && !data.edges) {
                console.error("Invalid response from backend:", data);
                throw new Error("Backend returned invalid response");
            }

            // Universal wall extraction — supports walls, segments OR lines
            const walls =
                data.walls ||
                data.segments ||
                data.lines ||
                data.edges ||
                [];

            if (walls.length === 0) {
                alert("No walls detected in the image. Please try with a clearer floor plan or use Manual Mode to draw walls.");
            }

            onWallsDetected(file, walls);
        } catch (error) {
            console.error("Upload error:", error);
            
            // Show specific error message
            let errorMessage = "Failed to process blueprint. ";
            
            if (error.message.includes("Network Error") || error.message.includes("Failed to fetch")) {
                errorMessage += "Cannot connect to backend server. Make sure it's running on http://127.0.0.1:8000";
            } else if (error.response?.status === 500) {
                errorMessage += "Server error. Please check the backend logs.";
            } else if (error.response?.status === 400) {
                errorMessage += "Invalid file format. Please upload a valid image.";
            } else if (error.response?.status === 413) {
                errorMessage += "File too large. Please use a smaller image.";
            } else {
                errorMessage += error.message || "Please try again.";
            }
            
            alert(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            setFile(droppedFile);
        }
    };

    return (
        <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto',
            padding: '30px'
        }}>
            {/* Upload Area */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                    marginBottom: '30px'
                }}
            >
                <motion.div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    whileHover={{ scale: 1.02 }}
                    style={{
                        padding: '60px 40px',
                        background: isDragging 
                            ? 'rgba(0, 242, 254, 0.15)' 
                            : 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '30px',
                        border: isDragging
                            ? '2px dashed rgba(0, 242, 254, 0.6)'
                            : '2px dashed rgba(255, 255, 255, 0.2)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: isDragging
                            ? '0 0 40px rgba(0, 242, 254, 0.3)'
                            : '0 8px 32px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                        style={{ display: 'none' }}
                        id="file-upload"
                    />
                    
                    <motion.label
                        htmlFor="file-upload"
                        style={{ cursor: 'pointer' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.div
                            animate={{ 
                                y: [0, -10, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ 
                                duration: 3, 
                                repeat: Infinity,
                                ease: "easeInOut" 
                            }}
                        >
                            <FileImage 
                                size={80} 
                                color={isDragging ? '#00f2fe' : '#764ba2'} 
                                strokeWidth={1.5}
                                style={{ marginBottom: '20px' }}
                            />
                        </motion.div>
                        
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: '#fff',
                            marginBottom: '10px',
                            fontFamily: 'Orbitron, sans-serif'
                        }}>
                            {file ? file.name : 'Upload Your Blueprint'}
                        </h3>
                        
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '1rem',
                            marginBottom: '20px'
                        }}>
                            {file 
                                ? `Selected: ${(file.size / 1024).toFixed(2)} KB`
                                : 'Drag & drop or click to browse'
                            }
                        </p>
                        
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '15px 40px',
                                background: file 
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                borderRadius: '50px',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                boxShadow: file
                                    ? '0 10px 30px rgba(102, 126, 234, 0.4)'
                                    : '0 10px 30px rgba(0, 242, 254, 0.4)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Upload size={20} />
                            {file ? 'Change File' : 'Choose Image'}
                        </motion.div>
                    </motion.label>
                </motion.div>
            </motion.div>

            {/* Upload Button */}
            {file && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ textAlign: 'center' }}
                >
                    <motion.button
                        onClick={handleUpload}
                        disabled={isUploading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '18px 50px',
                            background: isUploading 
                                ? 'linear-gradient(135deg, #999 0%, #aaa 100%)'
                                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            border: 'none',
                            borderRadius: '50px',
                            color: '#fff',
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            cursor: isUploading ? 'not-allowed' : 'pointer',
                            boxShadow: isUploading
                                ? 'none'
                                : '0 15px 40px rgba(245, 87, 108, 0.4)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            position: 'relative',
                            overflow: 'hidden',
                            fontFamily: 'Orbitron, sans-serif',
                            letterSpacing: '1px'
                        }}
                    >
                        {isUploading ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        border: '3px solid rgba(255,255,255,0.3)',
                                        borderTop: '3px solid #fff',
                                        borderRadius: '50%'
                                    }}
                                />
                                Processing...
                            </>
                        ) : (
                            <>
                                <ArrowRight size={24} />
                                Upload & Detect Walls
                            </>
                        )}
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
}
