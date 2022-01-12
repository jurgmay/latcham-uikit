four51.app.directive('customquantity', function() {
  var obj = {
    restrict: 'E',
    templateUrl: 'partials/controls/customQuantity.html',
	   controller: ['$scope', function($scope) {
       var qtyText = lineitem.PriceSchedule.QuantityMultiplier;
       $scope.quantity_text = qtyText;
     }]
   }
   return obj;
 });
