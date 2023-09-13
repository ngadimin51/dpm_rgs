<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Language" content="en">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title><?= isset($title) ? $title : 'RGS' ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no" />
    <meta name="description" content="Web App PT.Rekatama Global Sinergi.">
    <meta name="msapplication-tap-highlight" content="no">
    
	<!--
    =========================================================
    * ArchitectUI HTML Theme Dashboard - v1.0.0
    =========================================================
    * Product Page: https://dashboardpack.com
    * Copyright 2019 DashboardPack (https://dashboardpack.com)
    * Licensed under MIT (https://github.com/DashboardPack/architectui-html-theme-free/blob/master/LICENSE)
    =========================================================
    * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    -->
    
	<?= $this->include('partial/header') ?>

</head>
<body>
    <div class="app-container app-theme-white body-tabs-shadow fixed-sidebar fixed-header">
        
		<?= $this->include('partial/app-header') ?>
        
		<?= $this->include('partial/ui-theme-setting') ?>
		
        <div class="app-main">

			<?= $this->include('partial/menu') ?>

            <div id="test" class="app-main__outer">
                <div class="app-main__inner">

                    <?= $this->include('partial/app-page-title') ?>

                    <div class="row">
                        <div class="col-md-4">
                            <select name="project" id="" class="form-control">
                                <option value=""></option>
                                <?php foreach($project as $x) { ?>
                                    <option value="<?= $x ?>"><?= $x ?></option>
                                <?php } ?>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <select name="pekerjaan" id="" class="form-control">
                                <option value=""></option>
                                <?php foreach($pekerjaan as $x) { ?>
                                    <option value="<?= $x ?>"><?= $x ?></option>
                                <?php } ?>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <div class="input-group mb-3">
                                <input type="text" class="form-control" placeholder="Nama item" aria-label="Item" aria-describedby="button-addon2">
                                <div class="input-group-append">
                                    <button class="btn btn-outline-secondary" type="button" id="button-addon2" disabled>Button</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <?= $this->include('partial/footer') ?>

            </div>

        </div>
    </div>
</body>
</html>
