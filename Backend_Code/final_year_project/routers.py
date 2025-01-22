from rest_framework.routers import DefaultRouter
from user.views import UserViewSet,RegisterViewSet,ResendOtpViewSet,LoginViewSet,ForgotPasswordViewSet,ResetPasswordViewSet,ChangePasswordViewSet,LoginWithGoogleViewSet,VerifyEmailViewset

from course.views import CourseVideoViewSet,CourseViewSet,CourseFeedbackViewSet
router=DefaultRouter()


router.register("user",UserViewSet,basename="user")
router.register("register",RegisterViewSet,basename="register")

router.register("verify-otp",VerifyEmailViewset,basename="verify-otp")
router.register("resend-otp",ResendOtpViewSet,basename="resend-otp")
router.register("login",LoginViewSet,basename="login")
router.register("forgot-password",ForgotPasswordViewSet,basename="forgot-password")
router.register("reset-password",ResetPasswordViewSet,basename="reset-password")
router.register("change-password",ChangePasswordViewSet,basename="change-password")
router.register("google-authentication",LoginWithGoogleViewSet,basename="google-authentication")



router.register("course",CourseViewSet,basename="course")
router.register("course-video",CourseVideoViewSet,basename="course-video")
router.register("course-feedback",CourseFeedbackViewSet,basename="course-feedback")




