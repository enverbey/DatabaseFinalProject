document.addEventListener('DOMContentLoaded', () => {
    const typeDropdown = document.getElementById('TypeSearchValue');  

    
    fetch('/retrieve_types')
        .then(response => response.json())
        .then(types => {
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type.type_id;  
                option.textContent = type.type;  
                typeDropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching types:', error));
    
    

    const topicTextarea = document.getElementById('topic-textarea');
    const topicHiddenInput = document.getElementById('topic-hidden-input'); 
    const clearButton = document.getElementById('topic-menu-clear-btn'); 

    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'topicSelected') {
            const { subject_topics_id, topic_name } = event.data;
            
            topicTextarea.value = topic_name; 
            topicHiddenInput.value = subject_topics_id; 
        }
    });

    clearButton.addEventListener('click', () => {
        topicTextarea.value = ''; 
        topicHiddenInput.value = ''; 
    });

    
    const languageTextarea = document.getElementById('language-textarea');
    const languageHiddenInput = document.getElementById('language-hidden-input'); 
    const clearLanguageButton = document.getElementById('language-menu-clear-btn'); 

    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'languageSelected') {
            const { language_id, language } = event.data;

            
            languageTextarea.value = language; 
            languageHiddenInput.value = language_id; 
        }
    });

    clearLanguageButton.addEventListener('click', () => {
        languageTextarea.value = ''; 
        languageHiddenInput.value = ''; 
    });

    
    const universityTextarea = document.getElementById('university-textarea');
    const universityHiddenInput = document.getElementById('university-hidden-input'); 
    const clearUniversityButton = document.getElementById('university-menu-clear-btn'); 

    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'universitySelected') {
            const { university_id, uni_name } = event.data;

            
            universityTextarea.value = uni_name; 
            universityHiddenInput.value = university_id; 
        }
    });

    clearUniversityButton.addEventListener('click', () => {
        universityTextarea.value = ''; 
        universityHiddenInput.value = ''; 
    });
    
    const instituteTextarea = document.getElementById('institute-textarea');
    const instituteHiddenInput = document.getElementById('institute-hidden-input'); 
    const clearInstituteButton = document.getElementById('institute-menu-clear-btn'); 

    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'instituteSelected') {
            const { institute_id, institute_name } = event.data;

            
            instituteTextarea.value = institute_name; 
            instituteHiddenInput.value = institute_id; 
        }
    });

    clearInstituteButton.addEventListener('click', () => {
        instituteTextarea.value = ''; 
        instituteHiddenInput.value = ''; 
    });
    
    const supervisorTextarea = document.getElementById('supervisor-textarea');
    const supervisorHiddenInput = document.getElementById('supervisor-hidden-input');
    const cosupervisorTextarea = document.getElementById('cosupervisor-textarea');
    const cosupervisorHiddenInput = document.getElementById('cosupervisor-hidden-input');
    const clearSupervisorBtn = document.getElementById('supervisor-menu-clear-btn');
    const clearCoSupervisorBtn = document.getElementById('cosupervisor-menu-clear-btn');

    window.setSupervisor = (supervisorId, supervisorName) => {
        if (supervisorTextarea.value) {
            alert("Only one supervisor is allowed. Please clear the current selection first.");
            return;
        }

        supervisorTextarea.value = supervisorName;
        supervisorHiddenInput.value = supervisorId;
    };

    window.setCosupervisor = (cosupervisorId, cosupervisorName) => {
        if (!cosupervisorTextarea.value.includes(cosupervisorName)) {
            const cosupervisors = cosupervisorTextarea.value ? cosupervisorTextarea.value.split('\n') : [];
            cosupervisors.push(cosupervisorName);
            cosupervisorTextarea.value = cosupervisors.join('\n');

            const cosupervisorIds = cosupervisorHiddenInput.value ? cosupervisorHiddenInput.value.split(',') : [];
            cosupervisorIds.push(cosupervisorId);
            cosupervisorHiddenInput.value = cosupervisorIds.join(',');
        } else {
            alert("This cosupervisor is already added.");
        }
    };

    clearSupervisorBtn.addEventListener('click', () => {
        supervisorTextarea.value = '';
        supervisorHiddenInput.value = '';
    });
    clearCoSupervisorBtn.addEventListener('click', () => {
        cosupervisorTextarea.value = '';
        cosupervisorHiddenInput.value = '';
    });
});



function showTopicMenu(){
    const sList = window.open("/topicmenu", "list2", "top=50,left=450,width=300px,height=600px,resizable=yes,scrollbars=yes");
    }
function showLanguageMenu(){
    const sList = window.open("/languagemenu", "list2", "top=50,left=450,width=300px,height=600px,resizable=yes,scrollbars=yes");
    }
function showKeywordMenu(){
    const sList = window.open("/keywordmenu", "list2", "top=50,left=450,width=300px,height=600px,resizable=yes,scrollbars=yes");
    }
function showUniversityMenu(){
    const sList = window.open("/universitymenu", "list2", "top=50,left=450,width=300px,height=600px,resizable=yes,scrollbars=yes");
    }
function showInstituteMenu(){
    const sList = window.open("/institutemenu", "list2", "top=50,left=450,width=300px,height=600px,resizable=yes,scrollbars=yes");
    }
function showSupervisorMenu(){
    const sList = window.open("/supervisormenu", "list2", "top=50,left=450,width=300px,height=600px,resizable=yes,scrollbars=yes");
    }



document.getElementById('search-menu-search-btn').addEventListener('click', async () => {
    const TitleSearchValue = document.getElementById('TitleSearchValue').value;
    const AbstractSearchValue = document.getElementById('AbstractSearchValue').value;
    const AuthorSearchValue = document.getElementById('AuthorSearchValue').value;
    const year_lower = document.getElementById('search-year-lower').value;
    const year_upper = document.getElementById('search-year-upper').value;
    const type_id = document.getElementById('TypeSearchValue').value;
    const institute_id = document.getElementById('institute-hidden-input').value;
    const university_id = document.getElementById('university-hidden-input').value;
    const language_id = document.getElementById('language-hidden-input').value;
    const topic_id = document.getElementById('topic-hidden-input').value;
    const KeywordSearchValue = document.getElementById('KeywordSearchValue').value;

    const supervisor_id = document.getElementById('supervisor-hidden-input').value.split(',').filter(Boolean);
    const cosupervisor_id = document.getElementById('cosupervisor-hidden-input').value.split(',').filter(Boolean);
    
    
    
    const payload = {
        TitleSearchValue,
        AbstractSearchValue,
        AuthorSearchValue,
        year_lower,
        year_upper,
        type_id,
        institute_id,
        university_id,
        language_id,
        KeywordSearchValue,
        topic_id,
        supervisor_id,
        cosupervisor_id
    };

    try {
        const response = await fetch('/search_thesis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const returnedThesis = await response.json();

        
        window.opener.postMessage({ type: 'thesisResults', returnedThesis: returnedThesis }, '*');
        window.close();  

    } catch (error) {
        console.error('Search failed', error);
        alert('An error occurred. Please try again.');
    }
});
