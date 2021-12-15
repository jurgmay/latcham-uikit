four51.app.controller('CartViewCtrl', ['$scope', '$routeParams', '$location', '$451', '$timeout', 'Order', 'OrderConfig', 'User',
function ($scope, $routeParams, $location, $451, $timeout, Order, OrderConfig, User) {
	$scope.isEditforApproval = $routeParams.id != null && $scope.user.Permissions.contains('EditApprovalOrder');
	if ($scope.isEditforApproval) {
		Order.get($routeParams.id, function(order) {
			$scope.currentOrder = order;
			// add cost center if it doesn't exists for the approving user
			var exists = false;
			angular.forEach(order.LineItems, function(li) {
				angular.forEach($scope.user.CostCenters, function(cc) {
					if (exists) return;
					exists = cc == li.CostCenter;
				});
				if (!exists) {
					$scope.user.CostCenters.push({
						'Name': li.CostCenter
					});
				}
			});
		});
	}

	$scope.currentDate = new Date();

	$scope.errorMessage = null;

	$scope.continueShopping = function() {
		if (!$scope.cart.$invalid) {
			if (confirm('Do you want to save changes to your order before continuing?') == true)
				$scope.saveChanges(function() { $location.path('catalog') });
		}
		else
			$location.path('catalog');
	};

	$scope.cancelOrder = function() {
		if (confirm('Are you sure you wish to cancel your order?') == true) {
			$scope.displayLoadingIndicator = true;
			$scope.actionMessage = null;
			Order.delete($scope.currentOrder,
				function(){
					$scope.currentOrder = null;
					$scope.user.CurrentOrderID = null;
					User.save($scope.user, function(){
						$location.path('catalog');
					});
					$scope.displayLoadingIndicator = false;
					$scope.actionMessage = 'Your changes have been saved';
				},
				function(ex) {
					$scope.actionMessage = 'An error occurred: ' + ex.Message;
					$scope.displayLoadingIndicator = false;
				}
			);
		}
	};

	$scope.saveChanges = function(callback) {
		$scope.actionMessage = null;
		$scope.errorMessage = null;
		if($scope.currentOrder.LineItems.length == $451.filter($scope.currentOrder.LineItems, {Property:'Selected', Value: true}).length) {
			$scope.cancelOrder();
		}
		else {
			$scope.displayLoadingIndicator = true;
			OrderConfig.address($scope.currentOrder, $scope.user);
			Order.save($scope.currentOrder,
				function(data) {
					$scope.currentOrder = data;
					$scope.displayLoadingIndicator = false;
					if (callback) callback();
					$scope.actionMessage = 'Your Changes Have Been Saved';

				},
				function(ex) {
					$scope.errorMessage = ex.Message;
					$scope.displayLoadingIndicator = false;
				}
			)

		}

	};

	$scope.removeItem = function(item) {
		if (confirm('Are you sure you wish to remove this item from your cart?') == true) {
			Order.deletelineitem($scope.currentOrder.ID, item.ID,
				function(order) {
					$scope.currentOrder = order;
					Order.clearshipping($scope.currentOrder);
					if (!order) {
						$scope.user.CurrentOrderID = null;
						User.save($scope.user, function(){
							$location.path('catalog');
						});
					}
					$scope.displayLoadingIndicator = false;
					$scope.actionMessage = 'Your Changes Have Been Saved';
				},
				function (ex) {
					$scope.errorMessage = ex.Message.replace(/\<<Approval Page>>/g, 'Approval Page');
					$scope.displayLoadingIndicator = false;
				}
			);
		}
	}

	$scope.checkOut = function() {
		$scope.displayLoadingIndicator = true;
		if (!$scope.isEditforApproval)
			OrderConfig.address($scope.currentOrder, $scope.user);
		Order.save($scope.currentOrder,
			function(data) {
				$scope.currentOrder = data;
                $location.path($scope.isEditforApproval ? 'checkout/' + $routeParams.id : 'checkout');
				$scope.displayLoadingIndicator = false;
			},
			function(ex) {
				$scope.errorMessage = ex.Message;
				$scope.displayLoadingIndicator = false;
			}
		);
	};

	$scope.$watch('currentOrder.LineItems', function(newval) {
		var newTotal = 0;
		if (!$scope.currentOrder) return newTotal;
		angular.forEach($scope.currentOrder.LineItems, function(item, index){
	        if(!item.Product.SmallImageUrl){
    		    angular.forEach($scope.currentOrder.LineItems,function(li){
    		        if(item.Product.InteropID == li.Product.InteropID && (li.Product.SmallImageUrl)){
    		            item.Product.SmallImageUrl = li.Product.SmallImageUrl;
    		        }
    		    });
		    }
			if (item.IsKitParent)
				$scope.cart.$setValidity('kitValidation', !item.KitIsInvalid);
			newTotal += item.LineTotal;
		});
		$scope.currentOrder.Subtotal = newTotal;
	}, true);

    $scope.callUpdate = function(){
        if(!$scope.setPickr){
            $scope.setPickr = true;
            $timeout(function(){
                angular.forEach($scope.currentOrder.LineItems, function(item, index){
									function getMinimumDate(){
										var d = new Date();

										switch (d.getDay()) {
											case 0:
												d.setDate(d.getDate() + 1);
												break;
											case 1:
												d.setDate(d.getDate() + 2);
												break;
											case 2:
												d.setDate(d.getDate() + 2);
												break;
											case 3:
												d.setDate(d.getDate() + 2);
												break;
											case 4:
												d.setDate(d.getDate() + 4);
												break;
											case 5:
												d.setDate(d.getDate() + 4);
												break;
											case 6:
												d.setDate(d.getDate() + 3);
										};
										return d;
									};
									  var flatID = '#flatpickr-' + index;
										var minimumDate = getMinimumDate();
                    var pickerID = flatpickr(flatID,{
											minDate: minimumDate,
											altInput:true,
											altFormat:"D, d M Y",
											dateFormat:"Y-m-dTH:i:S",
											locale: {"firstDayOfWeek": 1}, // start week on Monday
											disable: [
												function(date) {
													// return true to disable
													return (date.getDay() === 0 || date.getDay() === 6);
												}
											]
										});

        			var valueID = document.querySelector(flatID);
        			valueID.value=flatpickr.formatDate(new Date(flatpickr.parseDate(item.DateNeeded,"Y-m-dTH:i:S")), "D, d M Y");
            	});
            },10);
        }
    };




	$scope.copyDateToAll = function() {
		angular.forEach($scope.currentOrder.LineItems, function(n,index) {
			n.DateNeeded = $scope.currentOrder.LineItems[0].DateNeeded;

			var valueID = document.querySelector("#flatpickr-" + index);
			var pickerID = flatpickr(valueID);
			pickerID.setDate(n.DateNeeded,"Y-m-dTH:i:S");
			valueID.value=flatpickr.formatDate(new Date(flatpickr.parseDate(n.DateNeeded,"Y-m-dTH:i:S")), "D, d M Y");

		});
	};

	$scope.copyCostCenterToAll = function() {
		angular.forEach($scope.currentOrder.LineItems, function(n) {
			n.CostCenter = $scope.currentOrder.LineItems[0].CostCenter;
		});
	};

	$scope.onPrint = function()  {
		window.print();
	};

	$scope.cancelEdit = function() {
		$location.path('order');
	};

    $scope.downloadProof = function(item) {
        window.location = item.Variant.ProofUrl;
    };
}]);
