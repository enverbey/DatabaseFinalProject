document.addEventListener('DOMContentLoaded', () => {
    const keywordsTableBody = document.getElementById('keywords-body');
    const keywordsFilter = document.getElementById('keywords-filter');
    const addkeywordInput = document.getElementById('keywords-adder');
    const addkeywordButton = document.getElementById('describekeywordbutton');

    let keywordsData = [];

    
    fetch('/retrieve_keywords_for_keyword_menu')
        .then(response => response.json())
        .then(keywords => {
            keywordsData = keywords;
            populatekeywordsTable(keywords);
        })
        .catch(error => console.error('Error while fetching keywords:', error));

    
    keywordsFilter.addEventListener('input', () => {
        const filterText = keywordsFilter.value.toLowerCase();
        const filteredkeywords = keywordsData.filter(keyword => keyword.keyword.toLowerCase().includes(filterText));
        populatekeywordsTable(filteredkeywords);
    });

    
    addkeywordButton.addEventListener('click', () => {
        const newkeyword = addkeywordInput.value.trim();
        if (newkeyword) {
            fetch('/add_keyword_to_keyword_menu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ keyword: newkeyword })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    keywordsData.push(result.keyword);
                    populatekeywordsTable(keywordsData);
                    addkeywordInput.value = '';
                } else {
                    alert('Error adding keyword:' + result.error);
                }
            })
            .catch(error => console.error('Error while adding keyword:', error));
        }
    });

    
    function populatekeywordsTable(keywords) {
        keywordsTableBody.innerHTML = '';
        keywords.forEach(keyword => {
            const row = document.createElement('tr');
            
            
            const removeButtonCell = document.createElement('td');
            const removeButton = document.createElement('button');
            removeButton.setAttribute("id", "delete-button");
            removeButton.textContent = 'Delete Forever';
            removeButton.addEventListener('click', () => removekeyword(keyword.keyword_id));
            removeButtonCell.appendChild(removeButton);
            row.appendChild(removeButtonCell);
            
            const keywordCell = document.createElement('td');
            keywordCell.textContent = keyword.keyword;
            row.appendChild(keywordCell);


            keywordCell.addEventListener('click', () => {
                window.opener.postMessage({
                    type: 'keywordSelected',
                    keyword_id: keyword.keyword_id,
                    keyword: keyword.keyword,
                }, '*');
            });

            keywordsTableBody.appendChild(row);
        });
    }

    
    function removekeyword(keywordId) {
        fetch(`/remove_keyword/${keywordId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                keywordsData = keywordsData.filter(keyword => keyword.keyword_id !== keywordId);
                populatekeywordsTable(keywordsData);
            } else {
                console.error('Error removing keyword:', result.error);
            }
        })
        .catch(error => console.error('Error while removing keyword:', error));
    }
});
