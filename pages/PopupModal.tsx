import React from "react";

interface PopupModalProps {
    isOpen: boolean; // Controls whether the modal is visible
    onClose: () => void; // Callback for closing the modal
    onLogin: () => void; // Callback for triggering the login action
    message: string; // Message to display in the modal
}

const PopupModal: React.FC<PopupModalProps> = ({ isOpen, onClose, onLogin, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <p className="text-gray-700 text-center mb-4">{message}</p>
                <div className="flex justify-around mt-4">
                    <button
                        onClick={onLogin}
                        className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
                    >
                        Log In
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 font-bold rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PopupModal;
