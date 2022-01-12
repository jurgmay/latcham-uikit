four51.app.directive('customquantity', function() {
  var obj = {
    restrict: 'E',
    templateUrl: 'partials/controls/customQuantity.html',
	   controller: ['$scope', function($scope) {
       var quantityMultiplier = lineitem.PriceSchedule.QuantityMultiplier;
       var unitOfMeasure = lineitem.Product.UnitOfMeasure;

       if ( unitOfMeasure === '' ) {
         $scope.quantity_text = '';
       } else {
         $scope.quantity_text = 'Supplied in ' + unitOfMeasure + ' of ' + quantityMultiplier;
       }

     }]
   }
   return obj;
 });
