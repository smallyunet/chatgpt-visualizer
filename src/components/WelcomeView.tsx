import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface WelcomeViewProps {
    onFileUpload: (file: File) => void;
    error: string | null;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onFileUpload, error }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.json')) {
            onFileUpload(file);
        } else {
            alert('Please upload a valid JSON file.');
        }
    }, [onFileUpload]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    }, [onFileUpload]);

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-4">
            <div className="max-w-2xl w-full text-center space-y-8">

                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        ChatGPT Visualizer
                    </h1>
                    <p className="text-lg text-gray-500">
                        Private, local visualization for your ChatGPT history.
                    </p>
                </div>

                <div
                    className={clsx(
                        "relative group cursor-pointer flex flex-col items-center justify-center w-full h-64 rounded-3xl border-2 border-dashed transition-all duration-300 bg-white",
                        isDragging ? "border-indigo-500 bg-indigo-50/50 scale-[1.02]" : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50",
                        error ? "border-red-300 bg-red-50" : ""
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".json"
                        onChange={handleFileSelect}
                    />

                    <div className="flex flex-col items-center space-y-4 pointer-events-none">
                        <div className={clsx(
                            "p-4 rounded-full transition-colors",
                            isDragging ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                        )}>
                            {error ? <AlertCircle className="w-8 h-8 text-red-500" /> : <Upload className="w-8 h-8" />}
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-gray-700">
                                {isDragging ? 'Drop it here!' : 'Click or drop conversations.json here'}
                            </p>
                            <p className="text-sm text-gray-400">
                                Usually found in the "user" folder of your export
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-sm font-medium bg-red-50 px-4 py-2 rounded-lg inline-block">
                        Error: {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-12">
                    <Step
                        num="1"
                        title="Export Data"
                        desc="Settings → Data controls → Export data in ChatGPT."
                    />
                    <Step
                        num="2"
                        title="Unzip"
                        desc="Extract the downloaded zip file from your email."
                    />
                    <Step
                        num="3"
                        title="Visualize"
                        desc="Drop conversations.json here to explore locally."
                    />
                </div>
            </div>
        </div>
    );
};

const Step = ({ num, title, desc }: { num: string, title: string, desc: string }) => (
    <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold mb-3">
            {num}
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
);
