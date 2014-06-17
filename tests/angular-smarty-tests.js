describe("smarty", function() { 
    // To configure angular-smarty-tests.js:
    // Variables that need to be edited:
    // expectedResults, line 31
    // expectedParsedResults, line 70
    // requestUrl, line 79
    // requestPrefix, line 80

    beforeEach(module("HomepageApp"));

    var scope;

    beforeEach(inject(function($rootScope) {
        scope = $rootScope.$new();
    }));

    // --- SMARTY CONTROLLER --- //
    describe("smarty controller", function() {
        beforeEach(inject(function($rootScope, $controller) {
            $controller("SmartyController", {
                $scope: scope
            });
        }));

        it("should initialize scope correctly", function() {
            expect(scope.selected).toEqual(-1);
            expect(scope.prefix).toEqual("");
            expect(scope.zip).toEqual("");
            expect(scope.suggestions).toEqual([]);
            expect(scope.selectionMade).toBe(false);
        });
    });

    // --- SMARTY SUGGESTOR SERVICE --- //
    describe("smarty suggestor", function() {
        var $httpBackend;
        var expectedResults = [
            {
                "ID":2,
                "Name":"Handyman",
                "Taxonym":"Handyman",
                "PluralTaxonym":"Handymen",
                "Rank":2.070353290907192
            },{
                "ID":835,
                "Name":"General Carpentry",
                "Taxonym":"Carpenter",
                "PluralTaxonym":"Carpenters",
                "Rank":1.8778105233780995
            },{
                "ID":10,
                "Name":"General Contracting",
                "Taxonym":"General Contractor",
                "PluralTaxonym":"General Contractors",
                "Rank":1.7331602733663476
            },{
                "ID":35,
                "Name":"Interior Design",
                "Taxonym":"Interior Designer",
                "PluralTaxonym":"Interior Designers",
                "Rank":1.7029912403077567
            },{
                "ID":317,
                "Name":"Metalwork",
                "Taxonym":"Metalworker",
                "PluralTaxonym":"Metalworkers",
                "Rank":1.6196185496387445
            }
        ];
        var expectedParsedResults = [
            "Handyman",
            "General Carpentry",
            "General Contracting",
            "Interior Design",
            "Metalwork"
        ];

        beforeEach(inject(function($injector) {
            var requestUrl = "";
            var requestPrefix = "";
            $httpBackend = $injector.get("$httpBackend");
            $httpBackend.when("GET", requestUrl).respond(
                expectedResults
            );
        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it("returns a promise", inject(function(smartySuggestor) {
            $httpBackend.expectGET(requestUrl);
            var results;
            smartySuggestor.getSmartySuggestions(requestPrefix).then(function(data) {
                results = data;
            }) 
            $httpBackend.flush();
            expect(results).toEqual(expectedParsedResults);
        }));
    });

    // --- SMARTY FOCUS ME DIRECTIVE --- //
    describe("smarty focusMe directive", function() {
        var element;

        beforeEach(function() {
            var html = '<input focus-me focus-when="[[ selectionMade ]]" name="foo" ' +
                'type="text" />';

            inject(function($compile, $rootScope) {
                scope = $rootScope.$new();
                scope.selectionMade = false;
                element = $compile(angular.element(html))(scope);
                scope.$digest();
                element.appendTo(document.body);
            });
        });

        afterEach(function() {
            element.remove();
        });

        it("is not in focus before selectionMade is true", function() {
            expect(element[0]).not.toEqual(document.activeElement);
        });

        it("is in focus after selectionMade is true", function() {
            scope.selectionMade = true;
            scope.$digest();
            expect(element[0]).toBe(document.activeElement);
        });
    });

    // --- SMARTY INPUT DIRECTIVE --- //
    describe("smarty input directive", function() {
        var element;
        var e; 
        
        beforeEach(function() {
            var html = '<input smarty-input selection-made="selectionMade" ' +
                'index="selected" select="setSelected(x)" list-items="suggestions" ' +
                'close="suggestionPicked()" ng-model="prefix">'; 

            var mockSuggestions = [
                "florist",
                "fence builder",
                "face painter",
                "fence repair",
                "flooring"
            ];

            e = $.Event("keydown");

            inject(function($compile, $rootScope, $controller) {
                scope = $rootScope;
                $controller("SmartyController", {
                    $scope: scope
                });
                scope.prefix = "f";
                scope.suggestions = mockSuggestions;
                element = $compile(angular.element(html))($rootScope);
                scope.$digest();
            });
        });

        it("should adjust index on down arrow presses", function() {
            expect(element.isolateScope().index).toEqual(-1);
            for (var i = 0; i < 6; i++) {
                e.which = 40;
                angular.element(element).triggerHandler(e);
                expect(element.isolateScope().index).toEqual(i % 6);
            };
        });

        it("should adjust index on up arrow presses", function() {
            var expectedIndices = [5, 4, 3, 2, 1, 0];
            expect(element.isolateScope().index).toEqual(-1);
            for (var i = 0; i < 6; i++) {
                e.which = 38;
                angular.element(element).triggerHandler(e);
                expect(element.isolateScope().index).toEqual(expectedIndices[i]);
            };
        });

        it("should, on enter, fill with the appropriate value", function() {
            e.which = 13; 
            angular.element(element).triggerHandler(e);
            expect(element.isolateScope().prefix).toEqual("f");
            expect(element.isolateScope().selectionMade).toBe(true);
        });

        it("should, on enter, fill with the appropriate value (index != 0)", function() {
            e.which = 40;
            angular.element(element).triggerHandler(e);
            e.which = 13; 
            angular.element(element).triggerHandler(e);
            expect(element.isolateScope().prefix).toEqual(mockSuggestions[0]);
            expect(element.isolateScope().selectionMade).toBe(true);
        });

        it("should, on tab, fill with the appropriate value", function() {
            e.which = 9;
            console.log("before:", element.isolateScope());
            angular.element(element).triggerHandler(e);
            console.log("after:", element.isolateScope());
            expect(element.isolateScope().prefix).toEqual("f");
            expect(element.isolateScope().selectionMade).toBe(true);
        });

        it("should, on tab, fill with the appropriate value (index != -1)", function() {
            e.which = 40;
            angular.element(element).triggerHandler(e);
            e.which = 9; 
            angular.element(element).triggerHandler(e);
            expect(element.isolateScope().prefix).toEqual(mockSuggestions[0]);
            expect(element.isolateScope().selectionMade).toBe(true);
        });
    });

    // --- SMARTY SUGGESTIONS DIRECTIVE --- //
    describe("smarty suggestions directive", function(){
        var element;

        beforeEach(function() {
            var html = '<div smarty-suggestions suggestions="suggestions" ' +
                'apply-class="setSelected(x)" select-suggestion="suggestionPicked()" ' +
                'selected="selected"></div>';
            var mockSuggestions = [
                "florist",
                "fence builder",
                "face painter",
                "fence repair",
                "flooring"
            ];
            
            inject(function($compile, $rootScope, $controller) {
                $controller("SmartyController", {
                    $scope: scope
                });
                element = $compile(angular.element(html))(scope);
                element.scope().suggestions = mockSuggestions;
                element.scope().$digest();
                scope = $rootScope.$new();
            });
        });

        it("should load p elements when scope.suggestions.length > 0", function() {
            expect(element.html()).toContain('<p');
        });

        it("should change class on mouseover", function() {
            var pElement = element.find("p").first()[0];
            expect(pElement.className).not.toContain("selected");
            angular.element(pElement).trigger("mouseover");
            expect(pElement.className).toContain("selected");
            expect(element.scope().selected).toEqual(0);
        });

        it("should update on click", function() {
            expect(element.scope().suggestions.length).toEqual(5);
            var pElement = element.find("p").first()[0];
            angular.element(pElement).trigger("click");
            expect(element.scope().suggestions.length).toEqual(0);
        });

        it("should disappear on outside click", function() {
            expect(element.scope().suggestions.length).toEqual(5);
            angular.element(document.body).trigger("click");
            expect(element.scope().suggestions.length).toEqual(0);
        });
    });
});

