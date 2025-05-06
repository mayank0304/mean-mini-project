angular.module("chatApp", []).controller("ChatController", function ($http) {
  var vm = this;
  vm.messages = [];
  vm.input = "";
  vm.loading = false;

  vm.sendMessage = function () {
    if (!vm.input.trim()) return;

    // Add user message
    vm.messages.push({
      role: "user",
      content: vm.input.trim(),
    });
    vm.input = "";
    vm.loading = true;

    // Send to backend
    $http
      .post("/api/chat", { messages: vm.messages })
      .then(function (response) {
        vm.messages.push(response.data.message);
      })
      .catch(function () {
        alert("Error connecting to AI");
      })
      .finally(function () {
        vm.loading = false;
      });
  };
});
