'use client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Modal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border border-orange-500 p-8 rounded-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold mb-3 text-white">Welcome to InfiniteBrew</h2>
        <p className="mb-6 text-gray-400 leading-relaxed">Drag objects to brew new objects.</p>
        <button
          onClick={onClose}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
