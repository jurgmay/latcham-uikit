four51.app.controller('shortProductViewCtrl', ['$routeParams', '$scope', 'ProductDisplayService', 'Order', 'User', '$location', '$route', function ($routeParams, $scope, ProductDisplayService) {
	$scope.LineItem = {};
	$scope.LineItem.Product = $scope.p;
	ProductDisplayService.setNewLineItemScope($scope);
	ProductDisplayService.setProductViewScope($scope);

	// Split product code with a carriage return if it contains ' - '
	var productCode = $scope.LineItem.Product.Name; // "NBT-PACK-400-BRISTOL - 30/04/2023 202AAD-L21";
	var separators = [' - '];
	var result = productCode.split(new RegExp(separators.join('|'), 'g'));
	// console.log(result.join(String.fromCharCode(10)));
	$scope.LineItem.Product.ProductCodeText = join(String.fromCharCode(10));

}]);
