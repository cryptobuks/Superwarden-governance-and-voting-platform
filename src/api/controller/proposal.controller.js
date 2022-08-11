const Announce=require("../model/announce.model"),Townhall=require("../model/townhall.model"),Proposal=require("../model/proposal.model"),moment=require("moment");async function createProposal(t,e,o){try{let o={};o.slug=t.body.slug,o.creator=t.body._id,o.cid=t.body.cid,t.body.data.f_start_date_at&&t.body.data.f_start_time_at&&t.body.data.f_end_date_at&&t.body.data.f_end_time_at&&(o.f_start_at=await makeDate(t.body.data.f_start_date_at,t.body.data.f_start_time_at),o.f_end_at=await makeDate(t.body.data.f_end_date_at,t.body.data.f_end_time_at)),t.body.data.s_start_date_at&&t.body.data.s_start_time_at&&t.body.data.s_end_date_at&&t.body.data.s_end_time_at&&(o.s_start_at=await makeDate(t.body.data.s_start_date_at,t.body.data.s_start_time_at),o.s_end_at=await makeDate(t.body.data.s_end_date_at,t.body.data.s_end_time_at)),new Proposal(Object.assign(o,t.body.data,{created_at:new Date})).save().then((async t=>{await refreshProposalStatus(t),e.json({proposal:t})}))}catch(t){console.log("api/controller/announce.controller/createBroadcast"+t)}}function makeDate(t,e){return`${t}T${e.HH}:${e.mm}:00.000Z`}function groupByVoteOption(t,e){let o=[];return t.map((t=>{let a={};a.option=t,a.amount=0,e.map((e=>{e.option==t&&(a.amount+=e.balance,a.symbol=e.symbol)})),o.push(a)})),o.sort((function(t,e){return e.amount-t.amount})),o}async function refreshProposalStatus(t){try{let o=new Date,a=60*o.getTimezoneOffset()*1e3,s=o.getTime()+a,n=60*moment().utcOffset(t.timezone.offset).utcOffset()*1e3;if(t.s_options.length<1){let o=new Date(t.f_start_at).getTime()-n+a,r=new Date(t.f_end_at).getTime()-n+a;if(o-s>0)t.status=0;else{if(t.voters.length>0){let e=await groupByVoteOption(t.options,t.voters);t.result=e}if(s>r)if(t.s_end_at){t.s_voters=[],t.s_result=[],t.s_options=[];let o=[];for(var e=0;e<2;e++)o.push(t.result[e].option);t.s_options=o,t.status=0}else t.status=2;else t.status=1}}else{let e=new Date(t.s_start_at).getTime()-n+a,r=new Date(t.s_end_at).getTime()-n+a;if(e-s>0)t.status=0;else{if(t.s_voters.length>0){let e=await groupByVoteOption(t.s_options,t.s_voters);t.s_result=e}console.log(o),t.status=s>r?2:1}}await t.save({new:!0})}catch(t){console.log("api/controller/announce.controller/refreshProposalStatus"+t)}}async function getProposalList(t,e,o){try{(await Proposal.find({slug:t.body.slug,$or:[{status:0},{status:1}]}).exec()).map((async t=>{await refreshProposalStatus(t)}));let o={};o.slug=t.body.slug,t.body.index>0?o.status=t.body.index:0==t.body.index&&(o.importance=!0),Proposal.find(o).populate("creator").sort("-created_at").exec().then((t=>{e.json({list:t})}))}catch(t){console.log("api/controller/announce.controller/getAnnouncementList"+t)}}async function getProposalData(t,e,o){try{Proposal.findById(t.body._id).populate("creator").exec().then((async t=>{await refreshProposalStatus(t),e.json({proposal:t})}))}catch(t){console.log("api/controller/proposal.controller/getProposalData"+t)}}async function deleteProposal(t,e,o){try{Proposal.deleteOne({_id:t.body._id}).exec().then((()=>{e.json({})}))}catch(t){console.log("api/controller/proposal.controller/"+t)}}async function sendVote(t,e,o){try{console.log(t.body),1==t.body.round?Proposal.findByIdAndUpdate(t.body._id,{$push:{voters:{$each:t.body.data}}}).exec().then((async t=>{e.json({updated:!0})})):Proposal.findByIdAndUpdate(t.body._id,{$push:{s_voters:{$each:t.body.data}}}).exec().then((async t=>{e.json({updated:!0})}))}catch(t){console.log("api/controller/proposal.controller/sendVote"+t)}}async function saveResultCID(t,e,o){try{Proposal.findByIdAndUpdate(t.body._id,{resultCID:t.body.cid}).exec().then((async t=>{e.json({updated:!0})}))}catch(t){console.log("api/controller/proposal.controller/"+t)}}async function sample(t,e,o){try{await user.save(),User.find({}).then((t=>{console.log(t)}));e.json({list:"okay"})}catch(t){console.log("api/controller/proposal.controller/"+t)}}module.exports={createProposal:createProposal,getProposalList:getProposalList,getProposalData:getProposalData,deleteProposal:deleteProposal,sendVote:sendVote,saveResultCID:saveResultCID};