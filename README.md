# mnx-color

AngularJS color picker directive

### Setup

Include required libraries

``` html
<link rel="stylesheet" href="mnx-color.css">

<script src="angular.js"></script>
<script src="mnx-color.js"></script>
```

Inject the `mnxColor` module

``` js
angular.module('app', ['mnxColor']);
```

### Usage

Apply the directive to the form element

``` html
<input mnx-color ng-model="color">
```
