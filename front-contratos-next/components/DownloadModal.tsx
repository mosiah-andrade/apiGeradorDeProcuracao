import React from 'react';
import AdSenseBanner from './AdSenseBanner';

interface Props {
  isOpen: boolean;
  timeLeft: number;
  readyToDownload: boolean;
  onClose: () => void;
  adKey: number;
}

export default function DownloadModal({ isOpen, timeLeft, readyToDownload, onClose, adKey }: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Preparando Documento...</h3>
        
        {timeLeft > 0 ? (
          <p>Seu download iniciará em <strong>{timeLeft}</strong> segundos.</p>
        ) : (
          !readyToDownload ? <p>Finalizando arquivo...</p> : null
        )}

        <div className="ad-container" style={{margin: '15px 0'}}>
          <AdSenseBanner key={adKey} />

          
        </div>
        
        {readyToDownload && (
          <>
            <p className="text-green-500 font-bold text-lg" style={{color: 'black'}}>Download Iniciado!</p>
            <button onClick={onClose} className="btn-secondary mt-2 text-gray-800" style={{color: 'black'}}>FECHAR</button>
          </>
        )}
      </div>
    </div>
  );
}