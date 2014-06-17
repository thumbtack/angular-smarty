(function() {
"use strict";

var app = angular.module("angular-smarty-config", []);

app.service("smartyConfig", ["$http", "$filter", function($http, $filter) {
    /* The default getSmartySuggestions function makes a request to requestUrl with the given
     * requestParams and expects an array of JSON objects in return, e.g. [{Name: suggestion1},
     * {Name: suggestion2}]
     */
    var requestUrl = "",
        requestParams = {};

    /* getSmartySuggestions should return a promise.  See the demo for an example of how to
     * construct an Angular promise.
     */
    function getSmartySuggestions(prefix) {
        requestParams["query"] = escape(prefix.toLowerCase());
        var promise = $http.get(requestUrl(),
            {
                params: requestParams,
                cache: true
            }
        )
        .then(function(response) {
            /* response.data is an the array of JSON objects where Name is the key used to identify
             * a suggestion
             */
            return $filter("limitTo")(response.data, 5).map(function(item) {
                return item.Name;
            });
        });
        return promise;
    }

    return {
        getSmartySuggestions: getSmartySuggestions
    }
}]);

app.service("smartySuggestor", ["smartyConfig", function(smartyConfig) {
    var getSmartySuggestions = smartyConfig.getSmartySuggestions;

    return {
        getSmartySuggestions: getSmartySuggestions
    };
}]);

})();
