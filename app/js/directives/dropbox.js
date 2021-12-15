four51.app.directive('dropbox', function () {
    return {
        restrict:'E',
        scope: { title: '@title' },
        templateUrl: 'partials/controls/dropbox.html'
    };
});