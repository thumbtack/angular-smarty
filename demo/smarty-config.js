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

app.service("smartySuggestor", ["$http", "smartyConfig", "$q", "$rootScope",
    function($http, smartyConfig, $q, $rootScope) {
        var possibleSuggestions = ["bakasana", "adho mukha svanasana", "adho mukha vrkshasana"];

        function getSmartySuggestions(prefix) {
            var deferred = $q.defer();
            setTimeout(function() {
                var suggestions = findSuggestions(prefix);
                if (suggestions.length > 0) {
                    deferred.resolve(suggestions);
                } else {
                    deferred.reject([]);
                }
            }, 0);
            return deferred.promise;
        };

        function findSuggestions(prefix) {
            var prefix = prefix.toLowerCase();
            var suggestions = [];
            for (var i = 0; i < possibleSuggestions.length; i++) {
                if (possibleSuggestions[i].length < prefix.length) {
                    continue;
                } else if (possibleSuggestions[i].slice(0, prefix.length) == prefix) {
                    suggestions.push(possibleSuggestions[i]);
                }
            }
            return suggestions;
        };
        
        return {
            getSmartySuggestions: getSmartySuggestions
        };
}]);
})();
