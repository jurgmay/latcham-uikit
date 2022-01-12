four51.app.directive('customquantity', ['$451', 'ProductDisplayService', function($451, ProductDisplayService){
    var obj = {
        scope: {
            lineitem : '=',
            calculated: '='
        },
        restrict: 'E',
        template: '<div>'+
            '<p>Quantity: {{getQtyText(lineitem)}}</p>'+
            '</div>',
        link: function(scope){
          $scope.getQtyText = function(lineitem){
              var qtyText = '999,999'; // lineitem.PriceSchedule.QuantityMultiplier

              return qtyText;
          };
        }
    }
    return obj;
}]);
