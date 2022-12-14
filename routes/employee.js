var express = require('express');
var router = express.Router();
var Leave = require('../models/leave');
var Attendance = require('../models/attendance');
var Param = require('../models/param');
//var Project = require('../models/project');
var moment = require('moment');
var User = require('../models/user');
var csrf = require('csurf');
var csrfProtection = csrf();
var moment = require('moment');
const leave = require('../models/leave');

router.use('/', isLoggedIn, function checkAuthentication(req, res, next) {
    next();
});



router.get('/', function viewHome(req, res, next) {
    Attendance.findOne({
        employeeID: req.session.user._id,
        month: new Date().getMonth()+ 1,
        date: new Date().getDate(),
        year: new Date().getFullYear(),
    }).exec(function getAttendance(err, docs){
    res.render('Employee/employeeHome', {
        title: 'Home',
        userName: req.session.user.name,
        csrfToken: req.csrfToken(),
        moment: moment,
        present: docs ? docs.present : false,
        isPulang: docs ? docs.waktupulang : false
    })
    });
});



router.get('/apply-for-leave', function applyForLeave(req, res, next) {

    Attendance.findOne({
        employeeID: req.session.user._id,
        month: new Date().getMonth()+ 1,
        date: new Date().getDate(),
        year: new Date().getFullYear(),
    }).exec(function getAttendance(err, docs){
      

        res.render('Employee/applyForLeave', {
            title: 'Pengajuan Lembur',
            csrfToken: req.csrfToken(),
            moment: moment,
            ket_out:0,
            present: docs ? docs.present : false,
            isPulang: docs ? docs.waktupulang : false,
            userName: req.session.user.name
        });

    });

    
    
    

});



router.get('/applied-leaves', function viewAppliedLeaves(req, res, next) {
    var leaveChunks = [];
    Attendance.findOne({
        employeeID: req.session.user._id,
        month: new Date().getMonth()+ 1,
        date: new Date().getDate(),
        year: new Date().getFullYear(),
    }).exec(function getAttendance(err, docs2){
    //find is asynchronous function
    Leave.find({applicantID: req.user._id}).sort({_id: -1}).exec(function getLeaves(err, docs) {
        var hasLeave = 0;
        var durasirumus=0;
        var a=0, b=0;
        if (docs.length > 0) {
            hasLeave = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            leaveChunks.push(docs[i]);
            

            console.log(durasirumus)
        }

        // for (var i = 0; i < leaveChunks.length; i++) {
        //     leaveChunks[i].applicantID
        // }

        res.render('Employee/appliedLeaves', {
            title: 'Daftar Lembur',
            csrfToken: req.csrfToken(),
            hasLeave: hasLeave,
            leaves: leaveChunks,
            durasi:durasirumus,
            moment: moment,
            present: docs2 ? docs2.present : false,
            isPulang: docs2 ? docs2.waktupulang : false,
            userName: req.session.user.name
        });
    });
});

});




router.post('/view-attendance', function viewAttendanceSheet(req, res, next) {
    var attendanceChunks = [];
    Attendance.find({
        employeeID: req.session.user._id,
        month: req.body.month,
        year: req.body.year
    }).sort({_id: -1}).exec(function getAttendance(err, docs) {
        var found = 0;
        if (docs.length > 0) {
            found = 1;
        }

        for (var i = 0; i < docs.length; i++) {
            attendanceChunks.push(docs[i]);
        }
        Attendance.findOne({
            employeeID: req.session.user._id,
            month: new Date().getMonth()+ 1,
            date: new Date().getDate(),
            year: new Date().getFullYear(),
        }).exec(function getAttendance(err, docs){
            res.render('Employee/viewAttendance', {
                title: 'Attendance Sheet',
                month: req.body.month,
                csrfToken: req.csrfToken(),
                found: found,
                attendance: attendanceChunks,
                moment: moment,
                ket_out:0,
                present: docs ? docs.present : false,
                isPulang: docs ? docs.waktupulang : false,
                userName: req.session.user.name
            });
        })
    });


});






router.get('/view-attendance-current', function viewCurrentlyMarkedAttendance(req, res, next) {
    var attendanceChunks = [];

    Attendance.find({
        employeeID: req.session.user._id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    }).sort({_id: -1}).exec(function getAttendanceSheet(err, docs) {
        var found = 0;
        if (docs.length > 0) {
            found = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            attendanceChunks.push(docs[i]);
        } 
        Attendance.findOne({
            employeeID: req.session.user._id,
            month: new Date().getMonth()+ 1,
            date: new Date().getDate(),
            year: new Date().getFullYear(),
        }).exec(function getAttendance(err, docs){
            res.render('Employee/viewAttendance', {
                title: 'Attendance Sheet',
                month: req.body.month,
                csrfToken: req.csrfToken(),
                found: found,
                attendance: attendanceChunks,
                moment: moment,
                ket_out:0,
                present: docs ? docs.present : false,
                isPulang: docs ? docs.waktupulang : false,
                userName: req.session.user.name
            });
        })
    });
});



router.get('/view-profile', function viewProfile(req, res, next) {

    Attendance.findOne({
        employeeID: req.session.user._id,
        month: new Date().getMonth()+ 1,
        date: new Date().getDate(),
        year: new Date().getFullYear(),
    }).exec(function getAttendance(err, docs2){

    User.findById(req.session.user._id, function getUser(err, user) {
        if (err) {
            console.log(err);

        }
        res.render('Employee/viewProfile', {
            title: 'Profile',
            csrfToken: req.csrfToken(),
            employee: user,
            moment: moment,
            present: docs2 ? docs2.present : false,
            isPulang: docs2 ? docs2.waktupulang : false,
            userName: req.session.user.name
        });
    });
});

});

router.post('/apply-for-leave', function applyForLeave(req, res, next) {

    Param.find({}).sort({_id: -1}).exec(function getParam(err, docs) {

        jam_mulai=parseFloat((req.body.jammulailembur).replace(':', '.'));
        jam_early_mulai_lembur=parseFloat((docs[0].earlyclockout).replace(':', '.'));
            if(req.body.tipehari=='Hari Kerja' && jam_mulai < jam_early_mulai_lembur){
                ket_out="Belum Waktu Jam Lembur"
                Attendance.findOne({
                    employeeID: req.session.user._id,
                    month: new Date().getMonth()+ 1,
                    date: new Date().getDate(),
                    year: new Date().getFullYear(),
                }).exec(function getAttendance(err, docs){
                    res.render('Employee/applyForLeave', {
                        title: 'Pengajuan Lembur',
                        csrfToken: req.csrfToken(),
                        moment: moment,
                        ket_out:ket_out,
                        present: docs ? docs.present : false,
                        isPulang: docs ? docs.waktupulang : false,
                        userName: req.session.user.name
                    });
                });

            }else{
                var newLeave = new Leave();
                newLeave.applicantID = req.user._id;
                newLeave.tujuanlembur = req.body.tujuanlembur;
                newLeave.jammulailembur = req.body.jammulailembur;
                newLeave.jamselesailembur = req.body.jamselesailembur;
                newLeave.tipehari = req.body.tipehari;
                newLeave.appliedDate = new Date();
                newLeave.adminResponse = 'Waiting Approval';
                newLeave.save(function saveLeave(err) {
                    if (err) {
                        console.log(err);
                    }
                    res.redirect('/employee/applied-leaves');
                });
            }
    });
});



router.post('/mark-employee-attendance',async function markEmployeeAttendance(req, res, next) {
    Param.find({}).sort({_id: -1}).exec(function getParam(err, docs) {
    if(req.body.tanda==0){
            var jam = req.body.waktumasuk.substring(0, 5)
           //console.log(jam);
           
            jam_masuk=parseFloat((jam).replace(':', '.'));
            jam_early_masuk_param=parseFloat((docs[0].earlyclockin).replace(':', '.'));

            if(jam_masuk < jam_early_masuk_param){
                ket_out="Belum Waktu Jam Masuk"
                var attendanceChunks = [];
                        Attendance.find({
                            employeeID: req.session.user._id,
                            month: new Date().getMonth() + 1,
                            year: new Date().getFullYear()
                        }).sort({_id: -1}).exec(function getAttendanceSheet(err, docs) {
                            var found = 0;
                            if (docs.length > 0) {
                                found = 1;
                            }
                            for (var i = 0; i < docs.length; i++) {
                                attendanceChunks.push(docs[i]);
                            } 
                            Attendance.findOne({
                                employeeID: req.session.user._id,
                                month: new Date().getMonth()+ 1,
                                date: new Date().getDate(),
                                year: new Date().getFullYear(),
                            }).exec(function getAttendance(err, docs){
                                res.render('Employee/viewAttendance', {
                                    title: 'Attendance Sheet',
                                    month: req.body.month,
                                    csrfToken: req.csrfToken(),
                                    found: found,
                                    attendance: attendanceChunks,
                                    moment: moment,
                                    ket_out:ket_out,
                                    present: docs ? docs.present : false,
                                    isPulang: docs ? docs.waktupulang : false,
                                    userName: req.session.user.name
                                });
                            })
                        });
            }else{

                jam_masuk_param=parseFloat((docs[0].clockin).replace(':', '.'));

                if(jam_masuk > jam_masuk_param){
                    keterangan = "Terlambat"
                } else if(jam_masuk <= jam_masuk_param){
                    keterangan = "Tepat Waktu"
                }  

                var newAttendance = new Attendance();
                newAttendance.employeeID = req.user._id;
                newAttendance.year = new Date().getFullYear();
                newAttendance.month = new Date().getMonth() + 1;
                newAttendance.date = new Date().getDate();
                newAttendance.present = 1;
                newAttendance.waktumasuk = req.body.waktumasuk;
                newAttendance.waktupulang = 0;
                newAttendance.keterangan = keterangan;
                newAttendance.save(function saveAttendance(err) {
                    if (err) {
                        console.log(err);
                    }

                }); 
                setTimeout(render_view, 900);
                function render_view() {
                res.redirect('/employee/view-attendance-current');
                }
            }
            

        }else{
            
                var jam2 = req.body.waktupulang.substring(0, 5)
                jam_pulang=parseFloat((jam2).replace(':', '.'));
                jam_pulang_param=parseFloat((docs[0].clockout).replace(':', '.'));
        
                if(jam_pulang < jam_pulang_param){
                    ket_out = "Belum Waktu Jam Pulang";
                     
                    var attendanceChunks = [];
                        Attendance.find({
                            employeeID: req.session.user._id,
                            month: new Date().getMonth() + 1,
                            year: new Date().getFullYear()
                        }).sort({_id: -1}).exec(function getAttendanceSheet(err, docs) {
                            var found = 0;
                            if (docs.length > 0) {
                                found = 1;
                            }
                            for (var i = 0; i < docs.length; i++) {
                                attendanceChunks.push(docs[i]);
                            } 
                            Attendance.findOne({
                                employeeID: req.session.user._id,
                                month: new Date().getMonth()+ 1,
                                date: new Date().getDate(),
                                year: new Date().getFullYear(),
                            }).exec(function getAttendance(err, docs){
                                res.render('Employee/viewAttendance', {
                                    title: 'Attendance Sheet',
                                    month: req.body.month,
                                    csrfToken: req.csrfToken(),
                                    found: found,
                                    attendance: attendanceChunks,
                                    moment: moment,
                                    ket_out:ket_out,
                                    present: docs ? docs.present : false,
                                    isPulang: docs ? docs.waktupulang : false,
                                    userName: req.session.user.name
                                });
                            })
                        });

                } else if(jam_pulang >= jam_pulang_param){
                    ket_out = 0;
                    res.redirect('/employee/update_pulang/'+req.body.waktupulang);
                 
                } 
           

        }

      
    });  

    });

module.exports = router;



function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

router.get('/update_pulang/:id',async function updatepulangs(req, res, next) {
    const attendance = await Attendance.findOneAndUpdate({
        employeeID: req.user._id,
        month: new Date().getMonth()+ 1,
        date: new Date().getDate(),
        year: new Date().getFullYear(),
    }, {
        waktupulang:req.params.id
    })
    setTimeout(render_view, 900);
        function render_view() {
        res.redirect('/employee/view-attendance-current');
        }

});
