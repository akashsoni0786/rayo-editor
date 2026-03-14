import React from 'react';
import './CustomEditorSkeleton.css';

const CustomEditorSkeleton = () => {
  return (
    <main className="editor-skeleton h-full overflow-auto">
      <ul className="o-vertical-spacing o-vertical-spacing--l">
        {/* Title Section */}
        <li className="blog-post o-media">
          <div className="o-media__body">
            <div className="o-vertical-spacing">
              <h3 className="blog-post__headline">
                <span className="skeleton-box" style={{ width: '55%' }}></span>
              </h3>
            </div>
          </div>
        </li>

        {/* Introduction Section */}
        <li className="blog-post o-media">
          <div className="o-media__body">
            <div className="o-vertical-spacing">
              <p>
                <span className="skeleton-box" style={{ width: '90%' }}></span>
                <span className="skeleton-box" style={{ width: '85%' }}></span>
                <span className="skeleton-box" style={{ width: '80%' }}></span>
              </p>
            </div>
          </div>
        </li>

        {/* Main Content Sections */}
        {[1, 2, 3].map((section) => (
          <li key={section} className="blog-post o-media">
            <div className="o-media__body">
              <div className="o-vertical-spacing">
                <h3 className="blog-post__headline">
                  <span className="skeleton-box" style={{ width: '40%' }}></span>
                </h3>
                <p>
                  <span className="skeleton-box" style={{ width: '85%' }}></span>
                  <span className="skeleton-box" style={{ width: '90%' }}></span>
                  <span className="skeleton-box" style={{ width: '83%' }}></span>
                  <span className="skeleton-box" style={{ width: '80%' }}></span>
                </p>
              </div>
            </div>
          </li>
        ))}

        {/* Conclusion Section */}
        <li className="blog-post o-media">
          <div className="o-media__body">
            <div className="o-vertical-spacing">
              <h3 className="blog-post__headline">
                <span className="skeleton-box" style={{ width: '30%' }}></span>
              </h3>
              <p>
                <span className="skeleton-box" style={{ width: '85%' }}></span>
                <span className="skeleton-box" style={{ width: '75%' }}></span>
              </p>
            </div>
          </div>
        </li>
      </ul>
    </main>
  );
};

export default CustomEditorSkeleton;