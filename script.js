document.addEventListener('DOMContentLoaded', (event) => {
    // Variables to manage state
    let selectedCard = null;  // To store the currently selected card, if any
    let correctOrder = [];  // To store the correct order of the cards
    let feedbackMode = false;  // Flag to determine if the user is in feedback mode

    // DOM references
    const resetActivityButton = document.getElementById('resetActivity');
    const checkAnswerButton = document.getElementById('checkAnswer');
    const cardContainer = document.getElementById('cardContainer');
    const feedbackEl = document.getElementById('feedback');
    feedbackEl.setAttribute('aria-live', 'polite');  // Announces changes in feedback content

    // Event listener for the reset button
    if (resetActivityButton) {
        resetActivityButton.addEventListener('click', function() {
            feedbackMode = false;  // Exit feedback mode
            location.reload();  // Reload the page to reset the activity
        });
    } else {
        console.error("resetActivity button not found in DOM");
    }

    // Event listener for the check answer button
    if (checkAnswerButton) {
        checkAnswerButton.addEventListener('click', checkAnswer);
    } else {
        console.error("checkAnswer button not found in DOM");
    }

    // Function to swap content of two cards
    function swapCards(card1, card2) {
        let tempContent = card1.innerHTML;
        card1.innerHTML = card2.innerHTML;
        card2.innerHTML = tempContent;
    }

    // Fetch card data from a JSON file and populate the cards on the page
    function fetchCardData() {
        fetch('cards.json')
            .then(response => response.json())
            .then(data => {
                correctOrder = data.correctOrder.map(card => card.content);
                console.log("Fetched correct order:", correctOrder);
                populateCards(data.initialOrder);
            })
            .catch(error => {
                console.error("Error loading card data:", error);
            });
    }

    // Function to populate the cards based on fetched data

            function populateCards(cardsData) {
        cardsData.forEach(card => {
            let div = document.createElement('div');
            div.className = 'card';
            div.dataset.id = card.id;
            div.innerHTML = card.content;
            div.setAttribute('tabindex', '0');  // Make the card selectable via keyboard
            div.setAttribute('role', 'listitem');  // Specify the role for the card
            div.setAttribute('aria-label', `Reference part: ${card.content}`);  // Add an aria-label for better clarity
            addCardListeners(div);  // Add event listeners to each card
            cardContainer.appendChild(div);
    
        });
    }

    // Add event listeners to the cards for interaction
    function addCardListeners(div) {
        div.addEventListener('touchend', cardInteractionHandler);  // Mobile touch event
        div.addEventListener('click', cardInteractionHandler);  // Mouse click event
        div.addEventListener('keydown', function(e) {  // Keyboard event
            if (e.key === 'Enter' || e.keyCode === 13) {
                cardInteractionHandler.call(div, e);  // Use the card as the context
            }
        });
    }

    // Function that handles card selection and swapping
    function cardInteractionHandler(e) {
        if (feedbackMode) return;  // If in feedback mode, exit and do nothing


        if (e.type === 'touchend') {
            e.preventDefault();  // Prevent default behavior for touchend
        }
        if (!selectedCard) {
            selectedCard = this;  // If no card is selected, select the current card
             this.setAttribute('aria-selected', 'true');
            this.classList.add('selected');
            console.log("Card selected:", this.innerHTML.trim());
        } else {
            swapCards(selectedCard, this);  // If a card is already selected, swap with the current card
            selectedCard.classList.remove('selected');
            selectedCard.removeAttribute('aria-selected');
            console.log("Cards swapped.");
            selectedCard = null;  // Reset the selected card
        }
    }

    // Utility function to strip out HTML tags (for clean comparison)
    function stripHtml(html) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    // Function to check if the current order of cards is correct
    function checkAnswer() {
        let cards = document.querySelectorAll('.card');
        let isCorrect = true;  // Assume the order is correct until proven otherwise
        feedbackMode = true;  // Enter feedback mode

        cards.forEach((card, index) => {
            card.classList.add('unselectable-card');  // Make cards unselectable during feedback
            card.setAttribute('tabindex', '-1');
            card.classList.remove('green', 'red');  // Reset feedback colors

            // Remove any existing feedback icons
            let existingTickIcon = card.querySelector('.icon.tick');
            let existingCrossIcon = card.querySelector('.icon.cross');

            if (existingTickIcon) existingTickIcon.remove();
            if (existingCrossIcon) existingCrossIcon.remove();

            // Get the actual content of the card and compare with the correct content
            let cardContent = stripHtml(card.innerHTML).trim();
            let correctAnswerWithHtml = correctOrder[index];
            let correctAnswerWithoutHtml = stripHtml(correctOrder[index]).trim();

            // Create and append feedback icons to the card
            let tickIcon = document.createElement('span');
            tickIcon.classList.add('icon', 'tick');
            tickIcon.innerHTML = '✓';
            tickIcon.setAttribute('aria-hidden', 'true');
            card.appendChild(tickIcon);

            let crossIcon = document.createElement('span');
            crossIcon.classList.add('icon', 'cross');
            crossIcon.innerHTML = '✗';
            crossIcon.setAttribute('aria-hidden', 'true');
            card.appendChild(crossIcon);

            // Check and provide feedback based on the card's correctness
            if (cardContent !== correctAnswerWithHtml && cardContent !== correctAnswerWithoutHtml) {
                card.classList.add('red');
                console.log(`Card at index ${index} is incorrect. Expected: ${correctAnswerWithHtml} or ${correctAnswerWithoutHtml}, Found: ${cardContent}`);
                isCorrect = false;
            } else {
                card.classList.add('green');
                console.log(`Card at index ${index} is correct.`);
            }
        });

        // Display global feedback based on correctness
        if (isCorrect) {
            feedbackEl.textContent = "Correct! Well done.";
        } else {
            feedbackEl.textContent = "Incorrect. Please try again.";
        }
    }

    // Fetch the card data and initiate the activity
    fetchCardData();

    
});
