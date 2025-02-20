from rest_framework.routers import DefaultRouter
from user.views import UserViewSet,RegisterViewSet,ResendOtpViewSet,LoginViewSet,ForgotPasswordViewSet,ResetPasswordViewSet,ChangePasswordViewSet,LoginWithGoogleViewSet,VerifyEmailViewset,UserArchiveViewset,UserRestoreViewset

from course.views import CourseVideoViewSet,CourseViewSet,CourseFeedbackViewSet,CourseCategoryViewSet

from chat.views import ChatIDViewSet,ChatMessageViewSet
from videocall.views import VideoRoomViewSet,VideoChatRoomViewSet,VideoChatMessageViewSet
from complaint.views import ComplaintViewSet

router=DefaultRouter()



router.register("user",UserViewSet,basename="user")
router.register("user-archive",UserArchiveViewset,basename="archive")
router.register("user-restore",UserRestoreViewset,basename="restore")




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
router.register("course-category",CourseCategoryViewSet,basename="course-category")


router.register("chat",ChatIDViewSet,basename="chat")
router.register("chat-message",ChatMessageViewSet,basename="chat_message")


router.register("video-chat-message",VideoChatMessageViewSet,basename="video-chat-message")
router.register("video-chat",VideoChatRoomViewSet,basename="video-chat")



router.register("video-call",VideoRoomViewSet,basename="video-call")


router.register("complaint",ComplaintViewSet,basename="complaint")





