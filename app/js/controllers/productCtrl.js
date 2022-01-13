four51.app.controller('ProductCtrl', ['$scope', '$routeParams', '$route', '$location', '$451', 'Product', 'ProductDisplayService', 'Order', 'Variant', 'User',
function ($scope, $routeParams, $route, $location, $451, Product, ProductDisplayService, Order, Variant, User) {
    $scope.isEditforApproval = $routeParams.orderID && $scope.user.Permissions.contains('EditApprovalOrder');
    if ($scope.isEditforApproval) {
        Order.get($routeParams.orderID, function(order) {
            $scope.currentOrder = order;
        });
    }

    $scope.selected = 1;
    $scope.LineItem = {};
	$scope.addToOrderText = "Add To Order";
	$scope.loadingIndicator = true;
	$scope.loadingImage = true;
	$scope.searchTerm = null;
	$scope.settings = {
		currentPage: 1,
		pageSize: 10
	};

	$scope.calcVariantLineItems = function(i){
		$scope.variantLineItemsOrderTotal = 0;
		angular.forEach($scope.variantLineItems, function(item){
			$scope.variantLineItemsOrderTotal += item.LineTotal || 0;
		})
	};
	function setDefaultQty(lineitem) {
		if (lineitem.PriceSchedule && lineitem.PriceSchedule.DefaultQuantity != 0)
			$scope.LineItem.Quantity = lineitem.PriceSchedule.DefaultQuantity;
	}

	/*social*/
	$scope.encodeComponent = function(value) {
		return encodeURIComponent(value);
	};
	/*social*/

	function init(searchTerm, callback) {
		ProductDisplayService.getProductAndVariant($routeParams.productInteropID, $routeParams.variantInteropID, function (data) {
			$scope.LineItem.Product = data.product;
			$scope.LineItem.Variant = data.variant;
			ProductDisplayService.setNewLineItemScope($scope);
			ProductDisplayService.setProductViewScope($scope);

			/*social*/
			$scope.LineItem.ShareName = $scope.LineItem.Product.Name.replace(/&/g, "and");
			$scope.tumblr_link_url = $location.absUrl();
			$scope.tumblr_link_name = $scope.LineItem.ShareName;
			$scope.tumblr_link_description = "Check out the " + $scope.tumblr_link_name + " on the COBC Site!";
			$scope.twitter_link_description = "Check out the " + $scope.tumblr_link_name + " on the COBC Site!";

      if ( $scope.LineItem.Product.UnitOfMeasure === '' ) {
        $scope.unitofmeasure_text = '';
      } else {
        var quantityAvailable = $scope.LineItem.Product.QuantityAvailable;
        var unitOfMeasureText = $scope.LineItem.Product.UnitOfMeasure;
        var quantityMultiplier = $scope.LineItem.PriceSchedule.QuantityMultiplier ;
        var unitOfMeasure = parseInt(unitOfMeasureText.replace(/[^0-9]/g,''),10);
        var batches = quantityAvailable / quantityMultiplier;
        $scope.unitofmeasure_text = '(' + batches + ' x ' + ( quantityMultiplier / unitOfMeasure ) + ' ' + unitOfMeasureText + ')';
      }

      if ( $scope.LineItem.Product.UnitOfMeasure === '' ) {
        $scope.quantity_text = '';
      } else {
        $scope.quantity_text = 'Supplied in ' + $scope.LineItem.Product.UnitOfMeasure';
      }

			$scope.shareFB = function(post){
				FB.ui(
					{
						method: 'share',
						picture: $scope.LineItem.Variant.PreviewUrl,
                        href: $scope.LineItem.Variant.PreviewUrl
					});
			}

			$scope.feedFB = function(post){
				FB.ui(
					{
						method: 'feed',
						name: $scope.LineItem.ShareName,
						link: 'https://accent.four51ordercloud.com/cobc/product/' + $scope.LineItem.Product.InteropID,
						picture: $scope.LineItem.Variant.PreviewUrl,
						caption: '',
						description: '',
						message: ''
					});
			}
			/*social*/

			setDefaultQty($scope.LineItem);
			$scope.$broadcast('ProductGetComplete');
			$scope.loadingIndicator = false;
			$scope.setAddToOrderErrors();
			if (angular.isFunction(callback))
				callback();
		}, $scope.settings.currentPage, $scope.settings.pageSize, searchTerm);
	}

	$scope.$watch('settings.currentPage', function(n, o) {
		if (n != o || (n == 1 && o == 1))
			init($scope.searchTerm);
	});

	$scope.searchVariants = function(searchTerm) {
		$scope.searchTerm = searchTerm;
		$scope.settings.currentPage == 1 ?
			init(searchTerm) :
			$scope.settings.currentPage = 1;
	};

	$scope.deleteVariant = function(v, redirect) {
		if (!v.IsMpowerVariant) return;
		// doing this because at times the variant is a large amount of data and not necessary to send all that.
		var d = {
			"ProductInteropID": $scope.LineItem.Product.InteropID,
			"InteropID": v.InteropID
		};
		Variant.delete(d,
			function() {
				redirect ? $location.path('/product/' + $scope.LineItem.Product.InteropID) : $route.reload();
			},
			function(ex) {
				if ($scope.lineItemErrors.indexOf(ex.Message) == -1) $scope.lineItemErrors.unshift(ex.Message);
				$scope.showAddToCartErrors = true;
			}
		);
	}

	$scope.addToOrder = function(){
		if($scope.lineItemErrors && $scope.lineItemErrors.length){
			$scope.showAddToCartErrors = true;
			return;
		}
		if(!$scope.currentOrder){
			$scope.currentOrder = { };
			$scope.currentOrder.LineItems = [];
		}
		if (!$scope.currentOrder.LineItems)
			$scope.currentOrder.LineItems = [];
		if($scope.allowAddFromVariantList){
			angular.forEach($scope.variantLineItems, function(item){
				if(item.Quantity > 0){
					$scope.currentOrder.LineItems.push(item);
					$scope.currentOrder.Type = item.PriceSchedule.OrderType;
				}
			});
		}else{
			$scope.currentOrder.LineItems.push($scope.LineItem);
			$scope.currentOrder.Type = $scope.LineItem.PriceSchedule.OrderType;
		}
		$scope.addToOrderIndicator = true;
		//$scope.currentOrder.Type = (!$scope.LineItem.Product.IsVariantLevelInventory && $scope.variantLineItems) ? $scope.variantLineItems[$scope.LineItem.Product.Variants[0].InteropID].PriceSchedule.OrderType : $scope.LineItem.PriceSchedule.OrderType;
		// shipper rates are not recalcuated when a line item is added. clearing out the shipper to force new selection, like 1.0
		Order.clearshipping($scope.currentOrder).
			save($scope.currentOrder,
				function(o){
					$scope.user.CurrentOrderID = o.ID;
					User.save($scope.user, function(){
						$scope.addToOrderIndicator = true;
						$location.path('/cart' + ($scope.isEditforApproval ? '/' + o.ID : ''));
					});
				},
				function(ex) {
					$scope.addToOrderIndicator = false;
					$scope.lineItemErrors.push(ex.Detail);
					$scope.showAddToCartErrors = true;
					//$route.reload();
				}
		);
	};

	$scope.setOrderType = function(type) {
		$scope.loadingIndicator = true;
		$scope.currentOrder = { 'Type': type };
		init(null, function() {
			$scope.loadingIndicator = false;
		});
	};

	$scope.showErrorModal = function() {

		// UIkit.modal.dialog('<p>UIkit dialog!</p>');

		// your logic goes here
		return true;
	};

	$scope.$on('event:imageLoaded', function(event, result) {
		$scope.loadingImage = false;
		$scope.$apply();
	});
}]);
