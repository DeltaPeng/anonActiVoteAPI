//function copied out to separate file to make it easier to manage

const loadRoom = (req, res, postgresDB) => {
	 
		
		const { roomName, gameData, miscData, movieData} = req.body;  
		console.log("roomjs test0 ", roomName); 
		//run some validation, don't allow any field to be blank OR empty spaces
		if ( !roomName.trim() ){
			//need a return here, to exit the function early so a fail on validation does not allow code to proceed
			return res.status(400).json('incorrect form submission1');			
		}
		
		console.log("roomjs test1.1");
		
		console.log("roomjs roomname: ",roomName, " this gameData: ", gameData," this miscData: ",miscData," this movieData: ",movieData)
		
		
	  var theMiscData = {}
	  var theGameData = {}
	  var theMovieData = {}
	  
	  console.log("here we goo right before the list making...here's theMiscList ", miscData.data)
	  var miscArr = (miscData.data).split(',')
	  console.log("miscARr is: ",miscArr)
	  
	  
	 console.log("here we goo right before the list making...here's theGameList ", gameData.data)
	  var gameArr = (gameData.data).split(',')
	  console.log("gameArr is: ",gameArr)
	  
	   console.log("here we goo right before the list making...here's theMovieList ", movieData.data)
	  var movieArr = (movieData.data).split(',')
	  console.log("movieARr is: ",movieArr)
	  
	  var combinedArr = new Array();			
	  
	  if (miscData) { 				   
		combinedArr = combinedArr.concat(miscArr)
	  }
	  if (gameData) { 				   
		combinedArr = combinedArr.concat(gameArr)
	  }
	  if (movieData) { 				   
		combinedArr = combinedArr.concat(movieArr)
	  }
	  
	  console.log("the combined arr  ",combinedArr)
	  
	  
	  var outputArr = new Array();
	  if (combinedArr.length > 0) { 
		postgresDB('miscdata').select('data','key','id') 
		.whereIn('id', combinedArr)
		.then(theData1 => {  					
			console.log("returned thedata misc: ", theData1)  
			 
			 return res.json(theData1);
		})
		.catch (err => console.log("got anCOMBINATION_ err: ",err)) 
	  } else {
		  //if no data, send error message
		return res.status(400).json('error end 1');
	  }	
}

const saveVote = (req, res, pgDB) => {
	  
		console.log("roomjs savevote test0 " ); 
		var { roomName, userName, voteID1, voteID2} = req.body;  
		
		var changeOccurred = false
		
		//run some validation, don't allow any field to be blank OR empty spaces
		if ( !roomName.trim() || !userName.trim() ){
			//need a return here, to exit the function early so a fail on validation does not allow code to proceed
			return res.status(400).json('incorrect form submission1');			
		}
		
		console.log("roomjs savevote test1 ", roomName); 
		roomName = roomName.trim();
		userName = userName.trim();
		
		console.log("roomjs savevote test1.1");
		 
		
		console.log("roomjs savevote roomname: ",roomName, " this v1: ", voteID1," this v2: ",voteID2)
		
		
		//should delete any previous entries on this room by this user, first
		pgDB('miscdata')
			.where("catlist","=","anonActivVote")
			.where("key","=",roomName + "\\" + userName)
			.delete()  
			.then( responseKey => { 
				console.log(" potentially deleted stuff");  
			})
			.catch (err => console.log("this err#1.1111",err))
			
		console.log("onto first vote check")
		if (voteID1 != -1) {
			pgDB('miscdata').insert(
			{  
				catlist: 'anonActivVote',
				key: roomName + "\\" + userName,
				data: voteID1
			})
			.returning('key')
			.then( responseKey => {
				//the response is the login email (thanks to .returning?), use [0] to ensure it's not an array, should only be one
				console.log(" #1and the key is: ",responseKey);
				console.log("#1 and the key is: ", responseKey[0]);   
				changeOccurred = true
			})
			.catch (err => console.log("this err#3",err))
		}
		
		console.log("onto second vote check")
		if (voteID2 != -1 && voteID1 != voteID2) {
			pgDB('miscdata').insert(
			{  
				catlist: 'anonActivVote',
				key: roomName + "\\" + userName,
				data: voteID2
			})
			.returning('key')
			.then( responseKey => {
				//the response is the login email (thanks to .returning?), use [0] to ensure it's not an array, should only be one
				console.log(" #2and the key is: ", responseKey);  
				console.log(" #2and the key is: ", responseKey[0]);   
				changeOccurred = true
			})
			.catch (err => console.log("this err#4",err))
		}
		
		console.log("final message")
		if (changeOccurred) 
			return res.json('success, a vote was changed/saved');
		else			
			return res.json('just no entries to update');	 
}

const loadVotes = (req, res, pgDB, knex1) => { 
		console.log("roomjs savevote test0 " ); 
		var { roomName } = req.body;   
		
		//run some validation, don't allow any field to be blank OR empty spaces
		if ( !roomName.trim() ){
			//need a return here, to exit the function early so a fail on validation does not allow code to proceed
			return res.status(400).json('incorrect form submission2');			
		}
		
		console.log("roomjs load voted items ", roomName); 
		roomName = roomName.trim(); 
		   
		//should delete any previous entries on this room by this user, first
		pgDB.raw(`select b.key as category,substring(b.key,1,1) as cat1,
				b.data, a.numEntries 
				from miscdata as b
				inner join (
					select data, count(data) as numEntries from miscdata where catlist='anonActivVote' and key like '${roomName}\%' group by data
				) as a on cast(a.data as int) = cast(b.id as int) 					
				where b.catlist='anonActivCat'
				order by b.data`) 
			.then( data1 => { 
				console.log("here's the grouped room loadItem data: ", data1);  
				 console.log("the rows data ", data1.rows); 
				return res.json(data1.rows);
			})
			.catch (err => console.log("this err#1.1111",err)) 
}

const loadUserVotes = (req, res, pgDB, knex1) => { 
		console.log("roomjs loadUserVotes test0 " ); 
		var { roomName, userName } = req.body;  
		 
		//run some validation, don't allow any field to be blank OR empty spaces
		if ( !roomName.trim() || !userName.trim()){
			//need a return here, to exit the function early so a fail on validation does not allow code to proceed
			return res.status(400).json('incorrect form submission3');			
		}
		
		console.log("roomjs load user's specific votes, for ini setting of dropdowns", roomName, " and ", userName); 
		roomName = roomName.trim(); 
		   
		//ordered by id, which ~should mean that it roughly loads in the order user entered it in
		pgDB.raw(`select data 
				from miscdata  				
				where catlist='anonActivVote' and key = '${roomName}\\${userName}'  
				order by id`) 
			.then( data1 => { 
				console.log("here's the grouped room loadItem data: ", data1);  
				 console.log("the rows data ", data1.rows); 
				return res.json(data1.rows);
			})
			.catch (err => console.log("this err#1.1111",err)) 
}

module.exports = {
	loadRoom: loadRoom,
	saveVote: saveVote,
	loadVotes: loadVotes,
	loadUserVotes: loadUserVotes
}