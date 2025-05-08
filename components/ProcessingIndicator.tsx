type ProcessingIndicatorProps = {
    isProcessing: boolean;
    currentImageTitle: string;
    dataComplete: boolean;
  };
  
  export const ProcessingIndicator = ({ isProcessing, currentImageTitle, dataComplete }: ProcessingIndicatorProps) => {
    if (!isProcessing && !dataComplete) return null;
  
    return (
      <div className="text-center">
        {isProcessing && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-light-text text-lg">{currentImageTitle}</p>
          </>
        )}
        {dataComplete && (
          <>
            <p className="text-accent-green text-lg font-semibold">Data Complete</p>
            <p className="text-light-text">Redirecting to dashboard...</p>
          </>
        )}
      </div>
    );
  };