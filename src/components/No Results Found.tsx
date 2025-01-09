

const NoResults = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Gray browser window illustration */}
      <div className="w-96 max-w-full mb-6">
        <div className="w-full h-6 bg-gray-200 rounded-t-lg flex items-center px-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
        </div>
        <div className="w-full aspect-video bg-gray-100 flex items-center justify-center p-8">
          <div className="w-24 h-24 text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      <h3 className="text-gray-900 text-lg font-medium mb-1">
        It looks like we can't find any results that match.
      </h3>
    </div>
  );
};

export default NoResults;