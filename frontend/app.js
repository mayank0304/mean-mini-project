angular.module('chatApp', [])
    .service('ChatService', function($http) {
        this.sendChat = function(messages) {
            return $http.post('http://localhost:3000/chat', { messages });
        };
    })
    .controller('ChatController', function(ChatService, $timeout, $scope) {
        var vm = this;
        
        // Initialize chat state
        vm.messages = [];
        vm.input = '';
        vm.loading = false;
        vm.error = '';

        // Function to scroll chat to bottom
        function scrollToBottom() {
            var chatHistory = document.getElementById('chat-history');
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }

        // Send message function
        vm.sendMessage = function() {
            if (!vm.input.trim()) return;

            // Clear any previous errors
            vm.error = '';

            // Add user message to chat
            vm.messages.push({
                role: 'user',
                content: vm.input.trim()
            });

            // Clear input and show loading
            vm.input = '';
            vm.loading = true;

            // Send to backend
            ChatService.sendChat(vm.messages)
                .then(function(response) {
                    if (response.data && response.data.message) {
                        vm.messages.push(response.data.message);
                    } else {
                        vm.error = 'No response from AI.';
                    }
                })
                .catch(function(error) {
                    vm.error = error.data?.error || 'Failed to connect to backend or Ollama.';
                })
                .finally(function() {
                    vm.loading = false;
                    // Scroll to bottom after response
                    $timeout(scrollToBottom, 100);
                });
        };

        // Initial scroll to bottom
        $timeout(scrollToBottom, 100);
    }); 