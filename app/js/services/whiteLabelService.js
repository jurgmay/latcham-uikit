four51.app.factory('WhiteLabel', function() {
	var replacements = [
		{"key":"addToOrderText","value":"Add To Order"},
		{"key":"Canceled","value":"Cancelled"},
		{"key":"Cart","value":"Order"},
		{"key":"Cart Summary","value":"Order Summary"},
		{"key":"Cart Type","value":"Order Type"},
		{"key":"Center","value":"Centre"},
		{"key":"Favorite","value":"Favourite"},
		{"key":"Favorites","value":"My Favourites"},
		{"key":"Cost Center","value":"Cost Centre"},
		{"key":"Shipping","value":"Delivery"},
		{"key":"Tax","value":"VAT"},
		{"key":"State","value":"County"},
		{"key":"User Information","value":"My Details"},
		{"key":"ZIP","value":"Postcode"}
	];

	return { replacements: replacements };
});

four51.app.directive('wrapOwlcarousel', function () { 
 return { 
 restrict: 'E', 
 link: function (scope, element, attrs) { 
 var options = scope.$eval($(element).attr('data-options')); 
 $(element).owlCarousel(options); 
 } 
 }; 
});
