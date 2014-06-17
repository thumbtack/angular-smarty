(function() {
"use strict";

var app = angular.module("angular-smarty", ["angular-smarty-config"]);

app.controller("SmartyController", [
    "$scope", "$document", "smartySuggestor", "$window", "$timeout",
    function($scope, $document, smartySuggestor, $window, $timeout) {
        /** Once the user has typed something in the input, smarty should
        *   handle the following situations accordingly:
        *   - User clicks outside the input or suggestions dropdown:
        *      - Suggestions dropdown disappears
        *      - Behaves normally when user clicks back into the input
        *   - User clicks a suggestion from the dropdown:
        *      - Suggestions dropdown disappears
        *      - Input is filled with value of clicked suggestion
        *      - Focus is on zipcode input
        *   - User presses up or down arrows, or hovers with mouse
        *      ($scope.userInteraction = true)
        *      - The selected suggestion changes accordingly
        *   - User presses enter or blurs the input
        *      - If there is a selection made, that selection should fill the input
        *      - If there is no selection made, whatever the user has currently typed
        *       should remain in the input
        *      - Focus is moved to the zipcode input
        */
        // $scope.suggestions holds the smart suggestions based on the current prefix.
        // If there are suggestions in the array, the suggestions drowdown will show.
        // $scope.prefix holds the value of the request input.
        // $scope.selected holds the index of $scope.suggestions that is
        // currently selected by the user.  If $scope.selected is -1, nothing is selected.
        $scope.suggestions = [];
        $scope.prefix = "";
        $scope.selected = -1;
        $scope.selectionMade = false;
        $scope.zip = "";

        $scope.$watch("prefix", function(newValue, oldValue) {
            if (newValue != oldValue && $scope.selectionMade == false) {
                if ($scope.prefix == "" || angular.isUndefined($scope.prefix)) {
                    $scope.suggestions = [];
                    $scope.selected = -1;
                } else {
                    var promise = smartySuggestor.getSmartySuggestions($scope.prefix);
                    promise.then(function(data) {
                        $scope.suggestions = data;
                    });
                }
            }
        });

        $scope.clickedSomewhereElse = function() {
            $scope.selected = -1;
            $scope.suggestions = [];
        };

        $document.bind("click", onDocumentClick);
        $scope.$on("$destroy", function() {
            $document.unbind("click", onDocumentClick);
        })
        function onDocumentClick() {
            $scope.$apply($scope.clickedSomewhereElse());
        }

        $scope.suggestionPicked = function() {
            if ($scope.selected != -1 && $scope.selected < $scope.suggestions.length) {
                $scope.prefix = $scope.suggestions[$scope.selected];
            }
            $scope.selectionMade = true;
            $scope.suggestions = [];
        };

        $scope.setSelected = function(newValue) {
            if (newValue > $scope.suggestions.length) {
                $scope.selected = 0;
            } else if (newValue < 0) {
                $scope.selected = $scope.suggestions.length;
            } else {
                $scope.selected = newValue;
            }
        };

        $scope.submitClicked = function() {
            if ($scope.requestFormStart.$valid) {
                $window.location = "/request?query=" + $scope.prefix + "&zipCode=" + $scope.zip +
                "&origin=homepage";
            }
        };
    }
]);

app.directive("smartyInput", function() {
    function link(scope, element) {
        element.bind("keydown", function(event) {
            switch(event.which) { 
                case 40: // down arrow
                    scope.$apply(function() {
                        scope.select({"x": parseInt(scope.index) + 1});
                    });
                    break;
                case 38: // up arrow
                    scope.$apply(function() {
                        scope.select({"x": parseInt(scope.index) - 1});
                    });
                    break;
                case 13: // enter
                    event.preventDefault();
                    if (scope.selectionMade == false) {
                        if (scope.index == "-1") {
                            scope.$apply(function() {
                                scope.listItems = [];
                            });
                        }
                        scope.$apply(function() {
                            scope.close();
                        })
                    }
                    break;
                default:
                    scope.$apply(function() {
                        scope.selectionMade = false;
                        scope.index = -1;
                    }); 
            }
        });

        element.bind("blur", function(event) {
            if (scope.listItems.length) {
                event.preventDefault();
                scope.$apply(function() {
                    scope.close();
                })
            }
        });
    }
    return {
        restrict: "A",
        link: link,
        scope: {
            prefix: "=ngModel",
            select: "&",
            index: "=",
            selectionMade: "=",
            listItems: "=",
            close: "&"
        }
    };
})

app.directive("smartySuggestions", ["$document", function($document) {
    // Watches the scope variable prefix, which is bound to an input field.
    // Updates suggestions when there is a change in prefix, but only when
    // selectionMade equals false.
    function link(scope, element, attrs) {
        element.bind("click", function(e) {
            e.stopPropagation();
        });
    }
    return {
        restrict: "A",
        link: link,
        scope: {
            suggestions: "=",
            selected: "=",
            applyClass: "&",
            selectSuggestion: "&",
            prefix: "@"
        },
        template: '<p ng-repeat="suggestion in suggestions" ' +
            'ng-class="{selected: $index == selected}" ' +
            'ng-mouseover="applyClass({x:$index})" ' +
            'ng-click="selectSuggestion()"> '+
                '[[suggestion]] ' +
            '</p>' +
            '<p ng-mouseover="applyClass({x:suggestions.length})" ' +
            'ng-class="{selected: suggestions.length == selected}" ' +
            'ng-click="selectSuggestion()" class="show-all"> ' +
            'Show all for "[[prefix]]" &raquo;</p>'
    };
}]);

app.directive("focusMe", function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            attrs.$observe("focusWhen", function() {
                if (attrs.focusWhen == "true") {
                    element[0].focus();
                }
            });
        }
    };
});

app.directive("smartySuggestionsBox", function() {
// Removes the need for duplicating the scode that makes the suggestions list. 
    return {
        restrict: "A",
        template: '<div smarty-suggestions apply-class="setSelected(x)"' +
            'select-suggestion="suggestionPicked()" suggestions="suggestions"' +
            'selected="selected" clicked-elsewhere="clickedSomewhereElse()"' +
            'ng-if="suggestions.length > 0" prefix="[[prefix]]"' +
            'class="autocomplete-suggestions-menu ng-cloak"></div>'
    };
});
})();
