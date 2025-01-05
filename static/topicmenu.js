document.addEventListener('DOMContentLoaded', () => {
    const topicsTableBody = document.getElementById('topics-body');
    const topicsFilter = document.getElementById('topics-filter');

    let topicsData = [];

    
    fetch('/retrieve_topics_for_topic_menu')
        .then(response => response.json())
        .then(topics => {
            topicsData = topics;
            populateTopicsTable(topics);
        })
        .catch(error => console.error('Error while fetching topics:', error));

    
    topicsFilter.addEventListener('input', () => {
        const filterText = topicsFilter.value.toLowerCase();
        const filteredTopics = topicsData.filter(topic => topic.topic_name.toLowerCase().includes(filterText));
        populateTopicsTable(filteredTopics);
    });

    
    function populateTopicsTable(topics) {
        topicsTableBody.innerHTML = '';
        topics.forEach(topic => {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 2;
            cell.textContent = topic.topic_name;
            row.appendChild(cell);

            
            cell.addEventListener('click', () => {
                window.opener.postMessage({
                    type: 'topicSelected',
                    subject_topics_id: topic.subject_topics_id,
                    topic_name: topic.topic_name,
                }, '*');
            });
            console.log(topics[0].topic_name);
            topicsTableBody.appendChild(row);
        });
    }
});
