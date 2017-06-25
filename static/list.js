var swPlanetsList = (function() {
    var apiLink = "http://swapi.co/api/planets";


    $('button[data-pagination]').click(function () {
        var newPage = $(this).attr('data-pagination');
        getPageData(newPage);
    });


    $('#toggleLoginForm').click(function(e) {
        $('#login').slideDown(200);
        $('#register').slideUp(200);
        $('.flash').dequeue().slideUp(200);
    });


    $('#toggleRegisterForm').click(function(e) {
        $('#register').slideDown(200);
        $('#login').slideUp(200);
        $('.flash').dequeue().slideUp(200);
    });


    $('#planet_details').on('click', '.votePlanet', function(e) {
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "/planet_vote",
            data: JSON.stringify({planetId: $(this).attr('data-planetId'), 
                                  planetName: $(this).attr('data-planetName')}),
            dataType: "json",
            success: function(replyFromFlask) {
                        flashMessageSuccess(replyFromFlask.message, replyFromFlask.category);
                        }
        });
    });


    $('#residentsModal').on('show.bs.modal', function (event) {
        $('#residents_list tbody').empty();
        $('#residents_list thead').empty();
        $('#vote_stats_container').empty();
        $('.spinner').show();
        var button = $(event.relatedTarget);
        if (button.data('residents')) {
            var planetName = button.data('planetname');
            var residentsApiLinks = button.data('residents').split(',');
            $.ajax({
                url: '/residents',
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(residentsApiLinks),
                dataType: "json"
            }).done(function (response){
                $('.spinner').hide();
                renderModalList(response);
            });
            var modal = $(this);
            modal.find('.modal-title').text('Residents of ' + planetName);
        } else if (event.relatedTarget.id === 'toggle_planet_votes') {
            $.ajax({
                url: '/planet_statistics',
                type: 'POST',
                dataType: "json"
            }).done(function (response) {
                $('.spinner').hide();
                renderVoteStats(response);
            });
            var modal = $(this);
            modal.find('.modal-title').text('Top voted planets');
        }
    })


    function flashMessageSuccess(message, category){
        $('.jquery-flash:hidden').remove();
        var messageFlash = `
                <div class="alert alert-${category} alert-dismissible jquery-flash" role="alert">
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    ${message}
                </div>`;
        $(messageFlash).prependTo($('#voteMessageContainer')).slideDown(300).delay(1000).slideUp(300);
    }


    function renderVoteStats(voteStats) {
        $.each(voteStats, function (i, planet) {
            progressBar = ` <h4>${planet.planet_name} - <small> ${planet.planet_votes} votes</small></h4>
                            <div class="progress">                
                                <div id="${planet.planet_name}"class="progress-bar" role="progressbar" aria-valuenow="${planet.percent_of_highest_vote}" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">
                                </div>
                            </div>`
            $(progressBar).appendTo("#vote_stats_container");
        });
        $.each(voteStats, function (i, planet) {
            $(`.progress-bar[id="${planet.planet_name}"`).animate({
                width: `${planet.percent_of_highest_vote}%`
            }, 2500);
        });
    }


    function renderModalList(residentsObj) {
        var header = `<th>Name</th>
                    <th>Height</th>
                    <th>Mass</th>
                    <th>Hair color</th>
                    <th>Skin color</th>
                    <th>Eye color</th>
                    <th>Birth year</th>
                    <th>Gender</th>`
        var html = '';
        $.each(residentsObj, function (i, resident) {
            html += '<tr>';
            html += `<td>${resident.name}</td>`;
            html += `<td>${resident.height}</td>`;
            html += `<td>${resident.mass}</td>`;
            html += `<td>${resident.hair_color}</td>`;
            html += `<td>${resident.skin_color}</td>`;
            html += `<td>${resident.eye_color}</td>`;
            html += `<td>${resident.birth_year}</td>`;
            html += `<td>${resident.gender}</td>`;
            html += '</tr>'
        });
        $('#residents_list thead').append(header);
        $(html).appendTo("#residents_list");
    }


    function getPageData(apiURL) {
        $.ajax({
            url: apiURL,
            type: 'GET',
            success: function(data){
                renderList(data);
            }
        });
    }


    function formatNumberAndAddUnit(numberToFormat, unitToAdd) {
        if (numberToFormat !== "unknown") {
            return numberToFormat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + unitToAdd;
        } else {
            return numberToFormat;
        }
    }


    function formatResidentsField(listOfResidents, planet) {
        if (listOfResidents != 0) {
            var btn = `<button type="button" class="btn btn-default btn-sm btnResidents" 
                        data-planetName="${planet}" 
                        data-residents="${listOfResidents}"
                        data-toggle="modal" 
                        data-target="#residentsModal">${listOfResidents.length} residents</button>`;
            return btn;
        } else {
            return "No known residents";
        }
    }


    function renderList(data) {
        $('#planet_details thead').empty();
        var header = '';
        if ($('#loginStatus').attr('data-user')) {
            header += "<th>Vote</th>";
        }
        header += "<th>Name</th><th>Diameter</th><th>Climate</th><th>Gravity</th><th>Terrain</th><th>Surface water</th><th>Population</th><th>Residents</th>";
        $('#planet_details thead').append(header)
        $('#planet_details tbody').empty();
        $.each(data.results, function (i, planet) {
            var html = "<tr>";
            if ($('#loginStatus').attr('data-user')) {
                var btn = '<button type="button" class="btn btn-default btn-sm votePlanet" data-planetName="'+ planet.name + '" data-planetId='+ planet.url +' ><span class="glyphicon glyphicon-thumbs-up"></span></button>';
                html += "<td>" + btn + "</td>";
            }
            html +="<td>"+planet.name+"</td>";
            html +="<td>"+formatNumberAndAddUnit(planet.diameter, "km")+"</td>";
            html +="<td>"+planet.climate+"</td>";
            html +="<td>"+planet.gravity+"</td>";
            html +="<td>"+planet.terrain+"</td>";
            html +="<td>"+formatNumberAndAddUnit(planet.surface_water, "%")+"</td>";
            html +="<td>"+formatNumberAndAddUnit(planet.population, "people")+"</td>";
            html +="<td>"+formatResidentsField(planet.residents, planet.name)+"</td>";
            html += "</tr>";
            $(html).appendTo("#planet_details");
        });
        $('button:contains("Next")').attr('data-pagination', data.next);
        $('button:contains("Previous")').attr('data-pagination', data.previous);

        // disable/enable next button if next page exists
        if ($('button:contains("Next")').attr('data-pagination') == undefined) {
            $('button:contains("Next")').prop('disabled', true);
        } else if ($('button:contains("Next")').attr('data-pagination') != undefined) {
            $('button:contains("Next")').prop('disabled', false);
        } 
        
        // disable/enable previous button if previous page exists
        if ($('button:contains("Previous")').attr('data-pagination') == undefined) {
            $('button:contains("Previous")').prop('disabled', true);
        } else if ($('button:contains("Previous")').attr('data-pagination') != undefined) {
            $('button:contains("Previous")').prop('disabled', false);
        }
    }


    $(document).ready(function(e) {
        getPageData(apiLink);
        $('#login').hide();
        $('#register').hide();
        $('.flash').delay(3000).slideUp(1000);
    })

    // FUNCTIONS AVAILABLE OUTSIDE
    return {};
})();
