// import { Button, Col, DatePicker, Row, Select, Slider } from 'antd';
// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
// import React, { useState } from 'react';
// import { ReactComponent as Graphico } from '../../src/Image/graphico.svg';
// import Graph1 from "./Graph1";
// dayjs.extend(customParseFormat);
// const { RangePicker } = DatePicker;
// const dateFormat = 'YYYY/MM/DD';

// function Dashboard() {
//     const [disabled, setDisabled] = useState(false);

//     return (
//         <>
//       <Row className='widgetrow' gutter={24}>
//         <Col xs={24} sm={12} lg={6}>
//           <div className='dwidget'>
//             <div className='icond'>
//               <Graphico />
//             </div>
//             <div className='count'><h3>$50,000</h3><p>Today's Teacher</p></div>
//             {/* <div className='percent'>
//               +16%
//             </div> */}
//           </div>
//         </Col>
//         <Col xs={24} sm={12} lg={6}>
//           <div className='dwidget'>
//             <div className='icond'>
//               <Graphico />
//             </div>
//             <div className='count'><h3>$50,000</h3><p>Today's Student</p></div>
//             <div className='percent'>
//               +16%
//             </div>
//           </div>
//         </Col>
//         <Col xs={24} sm={12} lg={6}>
//           <div className='dwidget'>
//             <div className='icond'>
//               <Graphico />
//             </div>
//             <div className='count'><h3>$50,000</h3><p>Today's Course</p></div>
//             <div className='percent'>
//               +16%
//             </div>
//           </div>
//         </Col>
//         <Col xs={24} sm={12} lg={6}>
//           <div className='dwidget'>
//             <div className='icond'>
//               <Graphico />
//             </div>
//             <div className='count'><h3>$50,000</h3><p>Today's Money</p></div>
//             <div className='percent'>
//               +16%
//             </div>
//           </div>
//         </Col>
//       </Row>
//       <Row className='graphrow' gutter={24}>
//         <Col xs={24} sm={12} lg={16}>
//           <div className='chartwrap' >
//             <div className='titled'>
//               Overview
//               <div className='daterangewrap'>
//                 <label>Select Date Range:</label>
//                 <RangePicker
//                   defaultValue={[dayjs('2015/01/01', dateFormat), dayjs('2015/01/01', dateFormat)]}
//                   format={dateFormat}
//                 />
//                 <Button
//                   type="primary"
//                   size='small'
//                   htmlType="submit"
//                 >
//                   GO
//                 </Button>
//               </div>
//             </div>

//             <Graph1 />

//           </div>
//         </Col>
//         <Col xs={24} sm={12} lg={8}>
//           <div className='boxdiv'>
//             <div className='titled'>
//               Sale <Select
//                 defaultValue="Last 365 day"
//                 style={{
//                   width: 120,
//                 }}

//                 options={[
//                   {
//                     value: 'Last 365 day',
//                     label: 'Last 365 day',
//                   },
//                 ]}
//               />
//             </div>
//             <Row gutter={16}>
//               <Col xs={24} sm={8} >
//                 <div className='inrbox invoice'>
//                   <div className='dot'></div>
//                   <h3>$50,000</h3>
//                   <p>50 Invoices</p>
//                 </div>
//               </Col>
//               <Col xs={24} sm={8} >
//                 <div className='inrbox paid'>
//                   <div className='dot'></div>
//                   <h3>$2356800</h3>
//                   <p>Paid</p>
//                 </div>
//               </Col>
//               <Col xs={24} sm={8} >
//                 <div className='inrbox balance'>
//                   <div className='dot'></div>
//                   <h3>$8796543</h3>
//                   <p>Balance</p>
//                 </div>
//               </Col>
//             </Row>
//           </div>
//           <div className='boxdiv'>
//             <div className='titled'>
//               Purchase <Select
//                 defaultValue="Last 365 day"
//                 style={{
//                   width: 120,
//                 }}

//                 options={[
//                   {
//                     value: 'Last 365 day',
//                     label: 'Last 365 day',
//                   },
//                 ]}
//               />
//             </div>
//             <Row gutter={16}>
//               <Col xs={24} sm={8} >
//                 <div className='inrbox invoice'>
//                   <div className='dot'></div>
//                   <h3>$50,000</h3>
//                   <p>10 Bills</p>
//                 </div>
//               </Col>
//               <Col xs={24} sm={8} >
//                 <div className='inrbox paid'>
//                   <div className='dot'></div>
//                   <h3>$2356800</h3>
//                   <p>Paid</p>
//                 </div>
//               </Col>
//               <Col xs={24} sm={8} >
//                 <div className='inrbox balance'>
//                   <div className='dot'></div>
//                   <h3>$8796543</h3>
//                   <p>Balance</p>
//                 </div>
//               </Col>
//             </Row>
//           </div>
//           <div className='boxdiv'>
//             <div className='titled'>
//               Profit/Loss <Select
//                 defaultValue="Last 365 day"
//                 style={{
//                   width: 120,
//                 }}

//                 options={[
//                   {
//                     value: 'Last 365 day',
//                     label: 'Last 365 day',
//                   },
//                 ]}
//               />
//             </div>
//             <div className='subtitle'>
//               <h3>$250,000</h3>
//               <p>Gross Profit</p>
//             </div>
//             <Row gutter={16}>
//               <Col xs={24}  >
//                 <div className='inrprofit green mb-4 '>
//                   <div className='dot'></div>
//                   <div>
//                     <h3>$50,000</h3>
//                     <p>10 Bills</p>
//                   </div>
//                   <div className='sliderwrp'><Slider defaultValue={30} disabled={disabled} /></div>
//                 </div>
//               </Col>
//               <Col xs={24}  >
//                 <div className='inrprofit red'>
//                   <div className='dot'></div>
//                   <div>
//                     <h3>$2356800</h3>
//                     <p>Paid</p>
//                   </div>
//                   <div className='sliderwrp'><Slider defaultValue={30} disabled={disabled} /></div>
//                 </div>
//               </Col>

//             </Row>
//           </div>
//         </Col>
//       </Row>
//     </>



//     );
// }

// export default Dashboard;


import { Button, Col, DatePicker, Row, Select } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState } from 'react';
import { ReactComponent as Graphico } from '../../src/Image/graphico.svg';
import Graph1 from "./Graph1";

dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    total_teacher: 0,
    total_student: 0,
    total_courses: 0,
    total_earn: 0,
    // Teacher specific data
    total_course_created: 0,
    total_course_feedback: 0,
    total_course_purchase_student: 0,
    total_revenue: 0
  });
  const [userType, setUserType] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("auth_token"));
        if (!authData || !authData.access_token) {
          console.error("Authentication tokens are missing. Please log in again.");
          return;
        }

        const accessToken = authData.access_token;
        const userType = authData.user?.type || '';
        const teacherId = authData.user?.id || '';

        setUserType(userType);

        let response;

        if (userType === 'Teacher') {
          // Teacher specific endpoint with POST request
          try {
            response = await axios.post(
              "http://localhost:8000/api/user/dashboared-teacher-api/",
              { teacher_id: teacherId },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            console.log("Success response:", response);
          } catch (error) {
            console.error("Error response:", error.response);
            // If the error response has data, use it anyway
            if (error.response && error.response.data && error.response.data.success) {
              response = error.response;
            } else {
              throw error; // Re-throw if it's not the specific case we're handling
            }
          }
        } else {
          // Admin endpoint with GET request
          response = await axios.get(
            "http://localhost:8000/api/user/dashboared-api/",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
        }

        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // Render different dashboard widgets based on user type
  const renderDashboardWidgets = () => {
    if (userType === 'Teacher') {
      // Teacher specific widgets
      return (
        <Row className='widgetrow' gutter={24}>
          <Col xs={24} sm={12} lg={6}>
            <div className='dwidget'>
              <div className='icond'>
                <Graphico />
              </div>
              <div className='count'>
                <h3>{dashboardData.total_course_created}</h3>
                <p>Total Courses Created</p>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className='dwidget'>
              <div className='icond'>
                <Graphico />
              </div>
              <div className='count'>
                <h3>{dashboardData.total_course_feedback}</h3>
                <p>Total Feedbacks</p>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className='dwidget'>
              <div className='icond'>
                <Graphico />
              </div>
              <div className='count'>
                <h3>{dashboardData.total_course_purchase_student}</h3>
                <p>Total Students</p>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className='dwidget'>
              <div className='icond'>
                <Graphico />
              </div>
              <div className='count'>
                <h3>{dashboardData.total_revenue}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
          </Col>
        </Row>
      );
    } else {
      // Admin specific widgets (default)
      return (
        <Row className='widgetrow' gutter={24}>
          <Col xs={24} sm={12} lg={6}>
            <div className='dwidget'>
              <div className='icond'>
                <Graphico />
              </div>
              <div className='count'>
                <h3>{dashboardData.total_teacher}</h3>
                <p>Total Teachers</p>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className='dwidget'>
              <div className='icond'>
                <Graphico />
              </div>
              <div className='count'>
                <h3>{dashboardData.total_student}</h3>
                <p>Total Students</p>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className='dwidget'>
              <div className='icond'>
                <Graphico />
              </div>
              <div className='count'>
                <h3>{dashboardData.total_courses}</h3>
                <p>Total Courses</p>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className='dwidget'>
              <div className='icond'>
                <Graphico />
              </div>
              <div className='count'>
                <h3>{dashboardData.total_earn}</h3>
                <p>Today's Earn</p>
              </div>
            </div>
          </Col>
        </Row>
      );
    }
  };

  return (
    <>
      {renderDashboardWidgets()}
      <Row className='graphrow' gutter={24}>
        <Col xs={24} sm={12} lg={16}>
          <div className='chartwrap'>
            <div className='titled'>
              Overview
              <div className='daterangewrap'>
                <label>Select Date Range:</label>
                <RangePicker
                  defaultValue={[dayjs('2015/01/01', dateFormat), dayjs('2015/01/01', dateFormat)]}
                  format={dateFormat}
                />
                <Button type="primary" size='small' htmlType="submit">
                  GO
                </Button>
              </div>
            </div>
            <Graph1 />
          </div>
        </Col>

        {userType === 'Teacher' ? (
          <Col xs={24} sm={12} lg={8}>
            <div className='boxdiv'>
              <div className='titled'>
                Teaching Stats <Select
                  defaultValue="All Time"
                  style={{ width: 120 }}
                  options={[
                    { value: 'This Month', label: 'This Month' },
                    { value: 'This Year', label: 'This Year' },
                    { value: 'All Time', label: 'All Time' }
                  ]}
                />
              </div>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <div className='inrbox invoice'>
                    <div className='dot'></div>
                    <h3>{dashboardData.total_course_created || 0}</h3>
                    <p>Courses</p>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className='inrbox paid'>
                    <div className='dot'></div>
                    <h3>{dashboardData.total_course_purchase_student || 0}</h3>
                    <p>Students</p>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className='inrbox balance'>
                    <div className='dot'></div>
                    <h3>{dashboardData.total_course_feedback || 0}</h3>
                    <p>Feedbacks</p>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        ) : (
          <Col xs={24} sm={12} lg={8}>
            <div className='boxdiv'>
              <div className='titled'>
                Key Metrics <Select
                  defaultValue="This Month"
                  style={{ width: 120 }}
                  options={[
                    { value: 'This Week', label: 'This Week' },
                    { value: 'This Month', label: 'This Month' },
                    { value: 'This Quarter', label: 'This Quarter' }
                  ]}
                />
              </div>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <div className='inrbox invoice'>
                    <div className='dot'></div>
                    <h3>{(dashboardData.total_student / dashboardData.total_teacher).toFixed(1) || 0}</h3>
                    <p>Students per Teacher</p>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className='inrbox paid'>
                    <div className='dot'></div>
                    <h3>${(dashboardData.total_earn / dashboardData.total_student).toFixed(2) || 0}</h3>
                    <p>Avg. Revenue per Student</p>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className='inrbox balance'>
                    <div className='dot'></div>
                    <h3>4.2/5</h3>
                    <p>Platform Rating</p>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        )}
      </Row>
    </>
  );
}

export default Dashboard;