angular.module("chatApp", []).controller("ChatController", function ($http) {
  var vm = this;
  vm.messages = [];
  vm.input = "";
  vm.loading = false;
  vm.user = null;
  vm.authTab = "login";
  vm.authLoading = false;
  vm.loginForm = { username: "", password: "" };
  vm.registerForm = { username: "", password: "" };
  vm.chatList = [];
  vm.currentChat = null;

  // Check if user is already logged in
  vm.checkAuthStatus = function () {
    $http.get("/api/auth/user").then(function (response) {
      if (response.data.authenticated) {
        vm.user = {
          username: response.data.username,
        };
        vm.loadChatList();
      }
    });
  };

  // Authentication functions
  vm.login = function () {
    vm.authLoading = true;
    $http
      .post("/api/auth/login", vm.loginForm)
      .then(function (response) {
        vm.user = {
          username: response.data.username,
        };
        vm.loginForm = { username: "", password: "" };
        vm.loadChatList();
      })
      .catch(function (error) {
        alert(error.data.error || "Login failed");
      })
      .finally(function () {
        vm.authLoading = false;
      });
  };

  vm.register = function () {
    vm.authLoading = true;
    $http
      .post("/api/auth/register", vm.registerForm)
      .then(function (response) {
        vm.user = {
          username: response.data.username,
        };
        vm.registerForm = { username: "", password: "" };
        vm.loadChatList();
      })
      .catch(function (error) {
        alert(error.data.error || "Registration failed");
      })
      .finally(function () {
        vm.authLoading = false;
      });
  };

  vm.logout = function () {
    $http.post("/api/auth/logout").then(function () {
      vm.user = null;
      vm.messages = [];
      vm.currentChat = null;
      vm.chatList = [];
    });
  };

  // Chat management functions
  vm.loadChatList = function () {
    $http.get("/api/chats").then(function (response) {
      vm.chatList = response.data;
      if (vm.chatList.length > 0 && !vm.currentChat) {
        vm.loadChat(vm.chatList[0]._id);
      }
    });
  };

  vm.loadChat = function (chatId) {
    $http.get("/api/chats/" + chatId).then(function (response) {
      vm.currentChat = response.data;
      vm.messages = response.data.messages;
    });
  };

  vm.newChat = function () {
    $http.post("/api/chats", { title: "New Chat" }).then(function (response) {
      vm.chatList.unshift(response.data);
      vm.currentChat = response.data;
      vm.messages = [];
    });
  };

  vm.updateChatTitle = function () {
    if (!vm.currentChat) return;

    $http
      .put("/api/chats/" + vm.currentChat._id, {
        title: vm.currentChat.title,
        messages: vm.messages,
      })
      .then(function (response) {
        // Update chat list entry
        for (var i = 0; i < vm.chatList.length; i++) {
          if (vm.chatList[i]._id === vm.currentChat._id) {
            vm.chatList[i].title = vm.currentChat.title;
            break;
          }
        }
      });
  };

  vm.deleteChat = function () {
    if (!vm.currentChat) return;

    if (confirm("Are you sure you want to delete this chat?")) {
      $http.delete("/api/chats/" + vm.currentChat._id).then(function () {
        // Remove from chat list
        vm.chatList = vm.chatList.filter(function (chat) {
          return chat._id !== vm.currentChat._id;
        });

        // Reset current chat
        if (vm.chatList.length > 0) {
          vm.loadChat(vm.chatList[0]._id);
        } else {
          vm.currentChat = null;
          vm.messages = [];
        }
      });
    }
  };

  vm.sendMessage = function () {
    if (!vm.input.trim()) return;

    // Make sure we have a chat to save to
    if (vm.user && !vm.currentChat) {
      vm.newChat();
      return;
    }

    // Add user message
    var userMessage = {
      role: "user",
      content: vm.input.trim(),
    };

    vm.messages.push(userMessage);
    vm.input = "";
    vm.loading = true;

    // Prepare request data
    var requestData = {
      messages: vm.messages,
    };

    // Add chatId if we have a current chat
    if (vm.currentChat) {
      requestData.chatId = vm.currentChat._id;
    }

    // Send to backend
    $http
      .post("/api/chat", requestData)
      .then(function (response) {
        vm.messages.push(response.data.message);

        // Save chat after AI response
        if (vm.currentChat) {
          vm.updateChatTitle();
        }
      })
      .catch(function () {
        alert("Error connecting to AI");
      })
      .finally(function () {
        vm.loading = false;
      });
  };

  // Initialize
  vm.checkAuthStatus();
});
