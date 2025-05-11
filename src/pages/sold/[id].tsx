                    <div className="flex items-center space-x-2 bg-yellow-50 px-6 py-3 rounded-full">
                      <span className="text-yellow-600 font-semibold text-xl">
                        {calculateAverageRating(allComments)}
                      </span>
                      <span className="text-yellow-500 text-2xl inline-flex items-center">★</span>
                      <span className="text-gray-600 text-sm inline-flex items-center">
                        ({allComments.length} reviews)
                      </span>
                    </div> 