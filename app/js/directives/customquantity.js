four51.app.directive('customquantity', function() {
    var obj = {
        restrict: 'E',
        templateUrl: 'partials/controls/customQuantity.html',
	    controller: ['$scope', function($scope) {
			var d = new Date();
		    $scope.custom_quantity = 999999;
	    }]
    }
    return obj;
});
