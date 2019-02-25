//function copied out to separate file to make it easier to manage

//looks at specific source, so handles it's own max check
const getRandValUnique = (numToGet, pgDB, listName, roomName) => {
	
	//get data for each individual list
	var randNumbListMisc = {}
	var currentListSize = ""
	
	pgDB('miscdata').select('id','data')
	.where('catlist','=','anonActivCat')
	.where('key','=',listName)
	.then(theData => { 
		console.log("list:", listName, " - the data0 is ",theData);
	    currentListSize = theData.length; 
		
		var outputData = ""
		
		console.log("the size ",currentListSize, " and numtoget is ", numToGet);
		if (numToGet >= currentListSize)
		{
			console.log("larger than");
			//then just include the whole list
			outputData = 'all'
		} else {
			console.log("smaller than");
			//get a random number of the entries based on how many are wanted
			var countLeft = numToGet;
			var min = 0
			var max=currentListSize -1;  			
			var randNum = 0;
			var randList = ',';
			
			//get randomized index list of items to get
			while (countLeft != 0) {
				randNum = Math.floor(Math.random() * (+max - +min)) + +min; 
				if (!randList.includes(",".concat(randNum).concat(","))) { 
					randList += randNum + ","
					countLeft--
					console.log(randList);
				}
			} 
			
			
			//change list to remove front and back ,
			//split into an array, so we can sort numerically
			//now, put into array, then sort numerically
			randList = randList.substring(1,randList.length-1)
			console.log('list shortened: ', randList)
			var points = randList.split(',')
			points.sort(function(a, b){return a - b});			
			console.log("pt1",points)
			
			
			//now, based on the randomized indices, get the data at that point and store the unique index for that record
			//parse through returned data, split it out into state
			var randListID = ',';
			  for (let j = 0; j < points.length; j++) {   
				randListID += theData[ points[j] ].id + ",";
			}
			
			randListID = randListID.substring(1,randListID.length-1)
			console.log('id list shortened2: ', randListID)
			var points2 = randListID.split(',') 
			console.log("pt2",points2) 
			
			//then convert it back to string so we can store the ordered string in db
			// assumes no special characters in list
		    outputData = points2.join(",").trim();
			console.log("the final sorted string, did it work??\n",outputData) 
			console.log('anonActivRoom' + listName)		
			
		}
		
		 pgDB('miscdata').insert(
		{  
			catlist: 'anonActivRoom' + listName,
			key: roomName.trim(),
			data: outputData
		})
		.returning('key')
		.then( responseKey => {
			//the response is the login email (thanks to .returning?), use [0] to ensure it's not an array, should only be one
			console.log(responseKey[0]);
			console.log(" and the key is: ", responseKey[0].key);  
		})
		.catch (err => console.log("this err#2",err))		
		
	})
	.catch (err => console.log("this err#1",err))	 
	
 
}

const setupRoom = (req, res, postgresDB) => {
		console.log('startr of func');
		
		//run some validation, don't allow any field to be blank OR empty spaces
		if (!req.body.userName.trim() == 'deltapeng' || !req.body.roomName.trim() || req.body.setupNumActivs <= 0)
		{
			//need a return here, to exit the function early so a fail on validation does not allow code to proceed
			return res.status(400).json('incorrect form submission2');			
		}
		   
		   console.log('before rand check', req.body.setupNumActivs, postgresDB);
		
		//get and log the index values of the randomized items for each list
		getRandValUnique(req.body.setupNumActivs, postgresDB, 'misc', req.body.roomName.trim());
		getRandValUnique(req.body.setupNumActivs, postgresDB, 'game', req.body.roomName.trim());
		getRandValUnique(req.body.setupNumActivs, postgresDB, 'movie', req.body.roomName.trim());
		
		console.log('after rand check all 3');
		 
		postgresDB('miscdata').insert(
		{  
			catlist: 'anonActivRoom',
			key: req.body.roomName.trim(),
			data: "settings to be added later"
		})
		.returning('key')
		.then( responseKey => {
			//the response is the login email (thanks to .returning?), use [0] to ensure it's not an array, should only be one
			console.log(responseKey[0]);
			console.log(" and the key is: ", responseKey[0].key); 
			
			if (responseKey[0])
				res.json(responseKey[0]);
		})  
		.catch (err => res.status(400).json('failure to create the room'))  
			
	  
	}

module.exports = {
	setupRoom: setupRoom
}