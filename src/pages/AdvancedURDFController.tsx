const AdvancedURDFController = () => {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <section className="relative py-16 bg-gradient-to-br from-background via-primary/5 to-secondary/10 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary mb-6">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium">Advanced Robot Lab</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
                Advanced URDF Visualizer
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                Upload and visualize your robot's URDF and mesh files in 3D with real-time pose detection and gesture control.
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>3D Robot Visualization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Real-time Pose Detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Gesture Control</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>File Upload Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        <div className="container mx-auto px-4 py-12">
          <div className="relative">
            <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-muted/30 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
              
              <div className="absolute inset-0 bg-gradient-to-br from-background/20 to-background/40 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity duration-500" id="loading-overlay">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Loading Advanced URDF Visualizer...</p>
                </div>
              </div>
              
              <div className="relative" style={{ width: '100%', height: '80vh' }}>
                <iframe
                  src="/advanced-urdf/humanoid_test.html"
                  title="Advanced URDF Visualizer"
                  width="100%"
                  height="100%"
                  className="rounded-2xl"
                  style={{ 
                    border: 'none', 
                    width: '100%', 
                    height: '100%',
                    background: 'transparent'
                  }}
                  allow="camera; fullscreen; microphone"
                  onLoad={() => {
                    const overlay = document.getElementById('loading-overlay');
                    if (overlay) {
                      overlay.style.opacity = '0';
                      setTimeout(() => overlay.style.display = 'none', 500);
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="mt-6 p-6 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 backdrop-blur-sm border border-white/10 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">How to Use</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload URDF files and mesh models to visualize your robot in 3D
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Features</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time pose detection, gesture control, and interactive 3D viewing
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Controls</h3>
                  <p className="text-sm text-muted-foreground">
                    Use mouse to rotate, scroll to zoom, and enable webcam for pose tracking
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default AdvancedURDFController; 