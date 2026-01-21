// components/ShareButtons.tsx
'use client';

import React from 'react';
import { FaWhatsapp, FaLinkedinIn, FaFacebookF, FaTwitter } from 'react-icons/fa';

interface ShareButtonsProps {
  title: string;
  url: string; 
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const fullUrl = url.startsWith('http') ? url : `https://asaweb.tech/blog/${url}`;
  
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'WhatsApp',
      color: '#25D366',
      icon: <FaWhatsapp />, 
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`
    },
    {
      name: 'LinkedIn',
      color: '#0077b5',
      icon: <FaLinkedinIn />, 
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    },
    {
      name: 'Facebook',
      color: '#1877F2',
      icon: <FaFacebookF />, 
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: 'Twitter',
      color: '#000000', // X preto
      icon: <FaTwitter />, 
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    }
  ];

  return (
    <div className="share-container">
      <h4 className="share-label" style={{color: 'var(--texto-corpo)'}}>Partilhar:</h4>
      
      <div className="share-icons">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Compartilhar no ${link.name}`}
            className="share-btn"
            // Mantemos apenas a cor dinâmica aqui, o resto está no CSS
            style={{ 
              ['--hover-color' as any]: link.color 
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = link.color;
              e.currentTarget.style.boxShadow = `0 5px 15px ${link.color}40`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-card)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {link.icon}
          </a>
        ))}
      </div>
    </div>
  );
}