# Mirrors www.cs.siue.edu: Fedora 43's own PHP packages, not the php:* images.
# Those compile readline into every binary and load sodium, which the server
# lacks, so their module set can never match. Fedora's packages ship the same
# per-extension ini files (/etc/php.d/20-*.ini) and pool defaults the server has.
FROM fedora:43

# The extensions in docker/expected-modules.txt, and nothing else (no
# php-sodium). fcgi provides cgi-fcgi, which docker/check-parity.sh uses to
# ask FPM itself what it loaded.
RUN dnf -y install --setopt=install_weak_deps=False \
        php-fpm php-cli php-common php-intl php-mbstring php-mysqlnd \
        php-opcache php-pdo php-process php-xml \
        fcgi \
    && dnf clean all \
    && mkdir -p /run/php-fpm

# The server's two local ini files; values match docker/expected-ini.txt.
COPY conf.d/ /etc/php.d/

# Fedora's pool listens on a unix socket for localhost only; nginx runs in
# another container, so listen on TCP for anyone on the compose network.
RUN sed -i \
        -e 's|^listen = .*|listen = 9000|' \
        -e 's|^listen.allowed_clients|;listen.allowed_clients|' \
        /etc/php-fpm.d/www.conf \
    && grep -q '^listen = 9000$' /etc/php-fpm.d/www.conf \
    && ! grep -q '^listen.allowed_clients' /etc/php-fpm.d/www.conf

EXPOSE 9000
CMD ["php-fpm", "--nodaemonize"]
