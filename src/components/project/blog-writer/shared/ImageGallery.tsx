import React from 'react';

const ImageGallery = () => {
  return (
    <div style={{
      width: '174.68px',
      height: '92.52px',
      position: 'relative',
      userSelect: 'none'
    }}>
      <img
        style={{
          width: '58.25px',
          height: '58.07px',
          left: '0.53px',
          top: '17.97px',
          position: 'absolute',
          transform: 'rotate(-3deg)',
          transformOrigin: 'top left',
          borderRadius: '8.85px',
          border: 'none',
          userSelect: 'none',
          pointerEvents: 'none',
          objectFit: 'cover',
          background: '#fff'
        }}
        src="https://cdn.rayo.work/Rayo_assests/Frame%201171278678.png"
        alt=""
      />

      <img
        style={{
          width: '58.25px',
          height: '58.07px',
          left: '116px',
          top: '14.92px',
          position: 'absolute',
          transform: 'rotate(3deg)',
          transformOrigin: 'top left',
          borderRadius: '8.85px',
          border: 'none',
          userSelect: 'none',
          pointerEvents: 'none',
          objectFit: 'cover',
          background: '#fff'
        }}
        src="https://cdn.rayo.work/Rayo_assests/Frame%201171278678%20(2).png"
        alt=""
      />

      <img
        style={{
          width: '76.50px',
          height: '76.26px',
          left: '49.10px',
          top: '-0.18px',
          position: 'absolute',
          boxShadow: '0px 2.523394823074341px 2.523394823074341px rgba(181, 161, 137, 0.25), 0px 5.046789646148682px 5.046789646148682px rgba(181, 161, 137, 0.25), 0px 10.093579292297363px 10.093579292297363px rgba(181, 161, 137, 0.25), 0px 20.187158584594727px 20.187158584594727px rgba(181, 161, 137, 0.25)',
          borderRadius: '11.62px',
          border: 'none',
          userSelect: 'none',
          pointerEvents: 'none',
          objectFit: 'cover',
          background: '#fff'
        }}
        src="https://cdn.rayo.work/Rayo_assests/Frame%201171278678%20(1).svg"
        alt=""
      />
    </div>
  );
};

export default ImageGallery;
