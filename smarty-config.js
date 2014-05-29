(function() {
"use strict";

var app = angular.module("angular-smarty-config", []);

app.service("smartyConfig", function() {
    var requestUrl = "",
        requestParams = {};

    function getRequestUrl() {
        return requestUrl;
    }

    function getRequestParams() {
        return requestParams;
    }

    return {
        getRequestUrl: getRequestUrl,
        getRequestParams: getRequestParams
    }
});

app.service("smartySuggestor", ["$http", "smartyConfig", function($http, smartyConfig) {
    function getSmartySuggestions(prefix) {
        var requestParams = smartyConfig.getRequestParams();
        requestParams["query"] = escape(prefix.toLowerCase());
        var promise = $http.get(smartyConfig.getRequestUrl(),
            {
                params: requestParams,
                cache: true
            }
        )
        .then(function(response) {
            // response.data is an array of objects
            return response.data.slice(0, 5).map(function(item) {
                return item.Name;
            });
        });
    return promise;
    }
    return {
        getSmartySuggestions: getSmartySuggestions
    };
}]);
})();
