from rest_framework import serializers
from user.models import User
from utils.generate_otp import generate_otp

class UserSerializer(serializers.ModelSerializer):
    email=serializers.CharField(required=True)
    dob = serializers.DateField(format="%d-%m-%Y", input_formats=["%d-%m-%Y", "%Y-%m-%d"], allow_null=True, required=False)
    profile_picture=serializers.FileField(allow_null=True)
    class Meta:
        model=User
        fields=[
            'id',
            "username",
            'email',
            'type',
            "profile_picture",
            'email_verified',
            "is_active",
            'otp',
            'gender',
            "dob",
            "bio",
            "created_at",
            "deleted"
        ]
        
    def validate(self, attrs):
        email = attrs.get("email")
        username = attrs.get("username")
        profile_picture = attrs.get("profile_picture")

        if self.instance:
            # When updating an instance, exclude the current user from the query
            if User.objects.filter(username=username).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Username already exists.")
        else:
            # For new instances
            if User.objects.filter(username=username).exists():
                raise serializers.ValidationError("Username already exists.")

        if self.instance:
            if User.objects.filter(email=email).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Email address already exists.")
        else:
            if User.objects.filter(email=email).exists():
                raise serializers.ValidationError("Email address already exists.")

        if profile_picture:
            
            allowed_extensions = ('.png', '.jpg', '.jpeg')
            if not profile_picture.name.lower().endswith(allowed_extensions):
                raise serializers.ValidationError( "Only PNG, JPG, or JPEG images are allowed.")
            
        else:
            if not self.instance:
                raise serializers.ValidationError("Profile picture is required.")        
        return attrs
        
    
    def create(self, validated_data):
        validated_data["email_verified"]=True
        validated_data["is_active"]=True
        return super().create(validated_data)
        
class RegisterSerializer(serializers.ModelSerializer):
    password2=serializers.CharField(required=False)
    email=serializers.CharField(required=True)
    class Meta:
        model=User
        fields=[
            "id",
            'username',
            'email',
            "password",
            "password2",
            "profile_picture",
            "type",
            'otp',
        ]
        
    def validate(self, attrs):
        email=attrs.get("email")
        username=attrs.get("username")
        password=attrs.get("password")
        password2=attrs.get("password2")
        type=attrs.get("type")
        
        
        if type=="" or type==None:
            raise serializers.ValidationError("User Type is Required")
        
        user_username_instanse=User.objects.filter(username=username,email_verified=True)
        if user_username_instanse.exists():
            raise serializers.ValidationError("Username already exists")
        
        user_email_instanse=User.objects.filter(email=email,email_verified=True)
        if user_email_instanse.exists():
            raise serializers.ValidationError("Email Address already exists")
        
        if password and (len(password) < 8 or len(password) > 14):
            raise serializers.ValidationError("Password length should be between 8 to 14 characters.")
        
        if password and password2 and password != password2:
            raise serializers.ValidationError("Password and Re-Password is not matching.")
        
        return attrs
    
    def create(self, validated_data):
        password2=validated_data.pop('password2')
        password=validated_data.pop('password')
        
        user=User.objects.create(**validated_data)
        user.otp=generate_otp()
        
        user.is_active=True
        
        user.set_password(password)
        
        user.save()
        
        return user
    

class OtpSerilaizer(serializers.Serializer):
    email=serializers.CharField(required=True)
    otp=serializers.CharField(required=True)
    