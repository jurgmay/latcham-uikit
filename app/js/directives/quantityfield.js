four51.app.directive('quantityfield', [
	'$451',
	'ProductDisplayService',
	function ($451, ProductDisplayService) {
		var obj = {
			scope: {
				lineitem: '=',
				calculated: '=',
				required: '=',
			},
			restrict: 'E',
			template:
				'<div>' +
				'<div ng-if="!lineitem.PriceSchedule.RestrictedQuantity">' +
				'<input class="uk-input" ng-disabled="lineitem.Variant.RecordCount > 0 && lineitem.ID" id="451qa_input_qty" placeholder="{{lineitem.Product.UnitOfMeasure}}" autocomplete="off" ng-change="qtyChanged(lineitem)" ng-if="!lineitem.PriceSchedule.RestrictedQuantity" type="text" ng-required="required" name="qtyInput" ng-model="lineitem.Quantity" ui-validate="\'validQuantityAddToOrder($value, lineitem)\'"/>' +
				'</div>' +
				'<div ng-if="lineitem.PriceSchedule.RestrictedQuantity">' +
				'<select id="451qa_input_qty" class="uk-select uk-form-width-small" ng-change="qtyChanged(lineitem)" ng-if="lineitem.PriceSchedule.RestrictedQuantity" ng-required="required" ng-model="lineitem.Quantity" ng-options="pb.Quantity as getRestrictedQtyText(pb, lineitem.Product.QuantityMultiplier) for pb in lineitem.PriceSchedule.PriceBreaks" ui-validate="\'validQuantityAddToOrder($value, lineitem)\'"><option value=""></option></select>' +
				'</div>' +
				'<inlineerror ng-show="lineitem.qtyError" title="{{lineitem.qtyError}}" class="uk-text-small uk-text-danger uk-margin-remove uk-text-nowrap"/>' +
				'</div>',
			link: function (scope) {
				scope.getRestrictedQtyText = function (priceBreak, qtyMultiplier) {
					var qtyText = priceBreak.Quantity * qtyMultiplier;
					if (qtyMultiplier > 1) qtyText += ' (' + priceBreak.Quantity + 'x' + qtyMultiplier + ')';
					return qtyText;
				};
				scope.qtyChanged = function (lineitem) {
					ProductDisplayService.calculateLineTotal(lineitem);
					if (scope.calculated) scope.calculated(lineitem);
				};
				scope.validQuantityAddToOrder = function (value, lineItem) {
					if (!value) return;
					var variant = lineItem.Variant;
					var product = lineItem.Product;
					var priceSchedule = lineItem.PriceSchedule;

					if (value === '' && !scope.required) {
						lineItem.qtyError = null;
						return scope.valid | true;
					}
					if (value === null) {
						scope.lineitem.qtyError = null;
						return scope.valid | true;
					}
					if (!product && !variant) return scope.valid | true;

					if (!priceSchedule) return scope.valid | true;

					scope.valid = true;

					if (!$451.isPositiveInteger(value)) {
						scope.lineitem.qtyError = 'This is not a valid value';
						scope.valid = false;
						return scope.valid;
					}

					if (priceSchedule.MinQuantity > value) {
						scope.valid = false;
						scope.lineitem.qtyError = 'This value must be equal or greater than ' + priceSchedule.MinQuantity;
					}

					if (priceSchedule.MaxQuantity && priceSchedule.MaxQuantity < value) {
						scope.lineitem.qtyError = 'This value must be equal or less than ' + priceSchedule.MaxQuantity;
						scope.valid = false;
					}

					if (product.IsVariantLevelInventory && !variant) {
						//console.log('variant not selected can't check quantity available'); //in vboss the user may select the qty before the variant. we may have to change when this gets called so inventory available can be re validated if the variant is chnaged based on a selection spec. It's probably not a big deal since the api will check inventory available on adding to order.
					} else {
						var qtyAvail =
							(product.IsVariantLevelInventory ? variant.QuantityAvailable : product.QuantityAvailable) + (lineItem.OriginalQuantity || 0);

						if (qtyAvail < value && product.AllowExceedInventory === false && priceSchedule.OrderType != 'Replenishment') {
							scope.lineitem.qtyError = 'This value cannot exceed the quantity available of ' + qtyAvail;
							scope.valid = false;
						}
					}

					if (scope.valid) scope.lineitem.qtyError = null;

					return scope.valid;
				};
			},
		};
		return obj;
	},
]);
