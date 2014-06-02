angular-smarty
==============

Autocomplete UI written with Angular JS.

Installation
---------------------

`bower install angular-smarty`

Configuration
---------------------

Configuration is handled in smarty-config.js which is injected into the main module in smarty.js.
The main configuration variable is the function getSmartySuggestions that returns a promise
containing the suggestions to be used in the autocomplete dropdown list. The default
getSmartySuggestions uses a url endpoint for a backend service that returns suggestions in the
following format: [{Name: suggestion1}, {Name: suggestion:2}, etc.].

Usage
---------------------

Include smarty-config.js and smarty.js in that order in your html.  In your main Angular module,
inject angular-smarty, or if you're not using Angular elsewhere on your page, include
`angular.bootstrap(angular.element("body"), ["angular-smarty"]);` in a script tag in your html and
don't forget that Angular is a dependency.

```js
$(function() {
    angular.bootstrap(angular.element("body"), ["angular-smarty"]);
});
```

Model your html after the following:

```html
<body ng-controller="SmartyController">
    <div class="container-main">
        <h1>angular-smarty demo</h1>
        <div class="container-autocomplete">
            <input type="text" smarty-input select="setSelected(x)"
                index="selected" list-items="suggestions" close="suggestionPicked()"
                selection-made="selectionMade" ng-model="prefix"></input>
            <div smarty-suggestions-box></div>
            <input type="text" focus-me focus-when="{{selectionMade}}"></input>
        </div>
    </div>
</body>
```
